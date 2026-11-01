import { PaymentMethod } from 'generated/prisma/client';

export interface CreateOrderDto {
  method: PaymentMethod;

  products: {
    id_product: string;
    amount: number;
  }[];
}
