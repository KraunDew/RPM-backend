import { Module } from '@nestjs/common';
import { CategoriesController } from 'src/controllers/categories.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CategoriesService } from 'src/services/categories.service';

@Module({
  imports: [PrismaModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
