import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaypalService } from './paypal/paypal.service';

import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaypalService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
