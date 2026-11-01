import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { PaymentMethod, PaymentStatus, Prisma } from 'generated/prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';
import { PaypalService } from './paypal/paypal.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paypal: PaypalService,
  ) {}

  async createPaypalOrder(
    id_user: string,
    products: {
      id_product: string;
      amount: number;
    }[],
  ) {
    if (!products?.length) {
      throw new BadRequestException('El carrito está vacío');
    }

    const ids = products.map((p) => p.id_product);

    if (
      ids.some((id) => !id) ||
      new Set(ids).size !== ids.length ||
      products.some((p) => !Number.isSafeInteger(p.amount) || p.amount <= 0)
    ) {
      throw new BadRequestException(
        'Los productos o cantidades no son válidos',
      );
    }

    const rate = Number(process.env.PAYPAL_USD_CLP_RATE);

    if (!Number.isFinite(rate) || rate <= 0) {
      throw new InternalServerErrorException(
        'El tipo de cambio no está configurado',
      );
    }

    const order = await this.prisma.$transaction(
      async (tx) => {
        const user = await tx.user.findUnique({
          where: { id_user },
          select: { id_user: true },
        });

        if (!user) {
          throw new NotFoundException('Usuario no encontrado');
        }

        const dbProducts = await tx.product.findMany({
          where: {
            id_product: { in: ids },
          },
          select: {
            id_product: true,
            name: true,
            price: true,
            stock: true,
          },
        });

        if (dbProducts.length !== products.length) {
          throw new NotFoundException('Uno o más productos no existen');
        }

        const productMap = new Map(dbProducts.map((p) => [p.id_product, p]));

        let total = 0;

        const details = products.map((item) => {
          const product = productMap.get(item.id_product)!;

          if (product.stock < item.amount) {
            throw new BadRequestException(
              `Stock insuficiente: ${product.name}`,
            );
          }

          const subtotal = product.price * item.amount;

          if (!Number.isSafeInteger(subtotal)) {
            throw new BadRequestException('Subtotal inválido');
          }

          total += subtotal;

          if (!Number.isSafeInteger(total)) {
            throw new BadRequestException('Total inválido');
          }

          return {
            id_product: item.id_product,
            amount: item.amount,
            unit_price: product.price,
          };
        });

        if (total <= 0) {
          throw new BadRequestException('El total debe ser mayor a cero');
        }

        const usdAmount = (total / rate).toFixed(2);

        if (Number(usdAmount) < 0.01) {
          throw new BadRequestException(
            'El importe convertido es inferior al mínimo de PayPal',
          );
        }

        return tx.order.create({
          data: {
            id_user,
            method: PaymentMethod.PAYPAL,
            status: PaymentStatus.PENDING,
            total,
            currency: 'USD',
            paymentAmount: new Prisma.Decimal(usdAmount),
            exchangeRate: new Prisma.Decimal(rate),
            detailOrders: {
              create: details,
            },
          },
        });
      },
      {
        maxWait: 15000,
        timeout: 30000,
      },
    );

    try {
      const paypalOrder = await this.paypal.createOrder(
        order.paymentAmount!.toFixed(2),
        order.id_order,
      );

      const approvalUrl = paypalOrder.links.find(
        (link) => link.rel === 'payer-action' || link.rel === 'approve',
      )?.href;

      if (!paypalOrder.id || !approvalUrl) {
        throw new Error('Respuesta incompleta de PayPal');
      }

      await this.prisma.order.update({
        where: { id_order: order.id_order },
        data: {
          paypalOrderId: paypalOrder.id,
        },
      });

      return {
        id_order: order.id_order,
        paypalOrderId: paypalOrder.id,
        approvalUrl,
        totalCLP: order.total,
        totalUSD: order.paymentAmount!.toFixed(2),
        currency: 'USD',
      };
    } catch (error) {
      await this.prisma.order.update({
        where: { id_order: order.id_order },
        data: {
          status: PaymentStatus.CANCELLED,
        },
      });

      throw new InternalServerErrorException(
        'No se pudo iniciar el pago con PayPal',
      );
    }
  }

  async capturePaypalOrder(id_user: string, paypalOrderId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        paypalOrderId,
        id_user,
        method: PaymentMethod.PAYPAL,
      },
    });

    if (!order) {
      throw new NotFoundException('Orden de PayPal no encontrada');
    }

    if (order.status === PaymentStatus.PAID) {
      return {
        success: true,
        message: 'El pago ya estaba confirmado',
        id_order: order.id_order,
      };
    }

    if (order.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Este pedido ya no puede pagarse');
    }

    const paypalOrder = await this.paypal.getOrder(paypalOrderId);

    const purchaseUnit = paypalOrder.purchase_units?.[0];

    if (
      paypalOrder.status !== 'APPROVED' ||
      !purchaseUnit ||
      purchaseUnit.reference_id !== order.id_order ||
      purchaseUnit.amount.currency_code !== order.currency ||
      purchaseUnit.amount.value !== order.paymentAmount?.toFixed(2)
    ) {
      throw new BadRequestException(
        'La orden de PayPal no coincide con el pedido de RPM',
      );
    }

    const result = await this.paypal.captureOrder(paypalOrderId);

    if (result.status !== 'COMPLETED') {
      throw new BadRequestException('PayPal todavía no ha completado el pago');
    }

    const capture = result.purchase_units
      ?.flatMap((unit) => unit.payments?.captures ?? [])
      .find((item) => item.status === 'COMPLETED');

    if (!capture) {
      throw new BadRequestException('No se encontró una captura completada');
    }

    const expectedAmount = order.paymentAmount?.toFixed(2);

    if (
      capture.amount.currency_code !== order.currency ||
      capture.amount.value !== expectedAmount
    ) {
      throw new BadRequestException(
        'El importe o moneda no coincide con el pedido',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.updateMany({
        where: {
          id_order: order.id_order,
          status: PaymentStatus.PENDING,
        },
        data: {
          status: PaymentStatus.PAID,
          paypalCaptureId: capture.id,
          paidAt: new Date(),
        },
      });

      if (updated.count !== 1) {
        throw new BadRequestException('El pedido ya fue procesado');
      }
    });

    return {
      success: true,
      message: 'Pago completado correctamente',
      id_order: order.id_order,
      paypalCaptureId: capture.id,
      amount: capture.amount.value,
      currency: capture.amount.currency_code,
    };
  }
}
