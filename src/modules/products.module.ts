import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ProductsController } from 'src/controllers/products.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProductsService } from 'src/services/products.service';
import { IAModule } from './ia.module';

@Module({
  imports: [
    PrismaModule,
    IAModule,
    MulterModule.register({
      dest: './public/photos',
    }),
  ],
  providers: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {}
