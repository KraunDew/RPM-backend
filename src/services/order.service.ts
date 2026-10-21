import { Injectable } from '@nestjs/common';
import type { Prisma } from 'generated/prisma/client';
import type { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  getAllOrders() {
    return this.prisma.order.findMany({
      include: {
        user: true,
        detailOrders: true,
      },
    });
  }
  getOrderById(id_order: string) {
    return this.prisma.order.findUnique({
      where: { id_order },
      include: {
        user: true,
        detailOrders: true,
      },
    });
  }
  async createOrder(
    id_user: string,
    total: number,
    method: Prisma.OrderCreateInput['method'],
    products: Prisma.DetailOrderCreateInput[],
  ) {
    if (!products || products.length === 0) {
      throw new Error('No products provided for the order');
    }
    return this.prisma.order.create({
      data: {
        id_user,
        total,
        method,
      },
    });
  }
}
