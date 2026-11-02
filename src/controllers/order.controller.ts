import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import { CreateOrderDto } from 'src/dto/create-order.dto';
import { JwtGuard } from 'src/guards/jwt.guard';
import { OrderService } from 'src/services/order.service';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
}

@Controller('/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  getAllOrders() {
    return this.orderService.getAllOrders();
  }

  @Get('/me')
  @UseGuards(JwtGuard)
  getMyOrders(@Req() req: AuthenticatedRequest) {
    if (!req.user?.id) {
      throw new BadRequestException('No se pudo identificar al usuario');
    }

    return this.orderService.getOrdersForUser(req.user.id);
  }

  @Get('/:id')
  async getOrderById(@Param('id') id: string) {
    const order = await this.orderService.getOrderById(id);

    if (!order) {
      throw new NotFoundException(`Pedido ${id} no encontrado`);
    }

    return order;
  }

  @Post()
  @UseGuards(JwtGuard)
  async createOrder(
    @Req() req: AuthenticatedRequest,
    @Body() data: CreateOrderDto,
  ) {
    if (!req.user?.id) {
      throw new BadRequestException('No se pudo identificar al usuario');
    }

    return this.orderService.createOrder(
      req.user.id,
      data.method,
      data.products,
    );
  }
}
