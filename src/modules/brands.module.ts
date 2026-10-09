import { Module } from '@nestjs/common';
import { BrandController } from 'src/controllers/brands.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BrandService } from 'src/services/brands.service';

@Module({
  imports: [PrismaModule],
  controllers: [BrandController],
  providers: [BrandService],
})
export class BrandModule {}
