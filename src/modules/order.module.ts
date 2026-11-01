import { Module } from '@nestjs/common';
import { OrderController } from 'src/controllers/order.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { OrderService } from 'src/services/order.service';

@Module({
  imports: [PrismaModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
