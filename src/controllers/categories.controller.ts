import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { CategoriesService } from 'src/services/categories.service';

@Controller('/categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  getAllCategories() {
    return this.categoriesService.getAll();
  }

  @Get('/:id')
  async getBrandById(@Param('id') id: string) {
    const brand = await this.categoriesService.getById(id);
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  @Post()
  async createBrand(@Body() data: Prisma.CategoryCreateInput) {
    return await this.categoriesService.createCategory(data);
  }

  @Patch('/:id')
  async updateBrand(
    @Param('id') id: string,
    @Body() data: Prisma.CategoryUpdateInput,
  ) {
    const brand = await this.categoriesService.updateCategory(id, data);
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  @Delete('/:id')
  async deleteBrand(@Param('id') id: string) {
    const brand = await this.categoriesService.deleteCategory(id);
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }
}
