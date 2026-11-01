import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import { CreateOrderDto } from 'src/dto/create-order.dto';
import { JwtGuard } from 'src/guards/jwt.guard';
import { PaymentsService } from './payments.service';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
}

@Controller('payments')
@UseGuards(JwtGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('paypal/create-order')
  createPaypalOrder(
    @Req() req: AuthenticatedRequest,
    @Body() data: CreateOrderDto,
  ) {
    if (!req.user?.id) {
      throw new BadRequestException('Usuario no autenticado');
    }

    return this.paymentsService.createPaypalOrder(req.user.id, data.products);
  }

  @Post('paypal/capture-order')
  capturePaypalOrder(
    @Req() req: AuthenticatedRequest,
    @Body() data: { paypalOrderId: string },
  ) {
    if (!req.user?.id || !data.paypalOrderId) {
      throw new BadRequestException('Datos de pago inválidos');
    }

    return this.paymentsService.capturePaypalOrder(
      req.user.id,
      data.paypalOrderId,
    );
  }
}
