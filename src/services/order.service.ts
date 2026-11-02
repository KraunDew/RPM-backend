import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PaymentStatus, Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  getAllOrders() {
    return this.prisma.order.findMany({
      include: {
        user: true,
        detailOrders: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  getOrderById(id_order: string) {
    return this.prisma.order.findUnique({
      where: { id_order },
      include: {
        user: true,
        detailOrders: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  getOrdersForUser(id_user: string) {
    return this.prisma.order.findMany({
      where: { id_user },
      include: {
        detailOrders: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async createOrder(
    id_user: string,
    method: Prisma.OrderCreateInput['method'],
    products: {
      id_product: string;
      amount: number;
    }[],
  ) {
    if (!id_user) {
      throw new BadRequestException('Usuario no válido');
    }

    if (!products?.length) {
      throw new BadRequestException('Debes agregar al menos un producto');
    }

    const productIds = products.map((item) => item.id_product);

    if (new Set(productIds).size !== productIds.length) {
      throw new BadRequestException('No puedes enviar productos duplicados');
    }

    for (const item of products) {
      if (
        !item.id_product ||
        !Number.isSafeInteger(item.amount) ||
        item.amount <= 0
      ) {
        throw new BadRequestException(
          'Los productos o cantidades no son válidos',
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id_user },
        select: { id_user: true },
      });

      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      const dbProducts = await tx.product.findMany({
        where: {
          id_product: {
            in: productIds,
          },
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

      const productMap = new Map(
        dbProducts.map((product) => [product.id_product, product]),
      );

      let total = 0;

      const details = products.map((item) => {
        const product = productMap.get(item.id_product)!;

        if (product.stock < item.amount) {
          throw new BadRequestException(
            `Stock insuficiente para ${product.name}`,
          );
        }

        const subtotal = product.price * item.amount;

        if (!Number.isSafeInteger(subtotal)) {
          throw new BadRequestException(
            'El importe del pedido es demasiado grande',
          );
        }

        total += subtotal;

        if (!Number.isSafeInteger(total)) {
          throw new BadRequestException('El total del pedido no es válido');
        }

        return {
          id_product: product.id_product,
          amount: item.amount,
          unit_price: product.price,
        };
      });

      return tx.order.create({
        data: {
          id_user,
          method,
          total,
          status: PaymentStatus.PENDING,
          detailOrders: {
            create: details,
          },
        },
        include: {
          detailOrders: {
            include: {
              product: true,
            },
          },
        },
      });
    });
  }
}
