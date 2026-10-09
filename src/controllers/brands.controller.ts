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
import { BrandService } from 'src/services/brands.service';

@Controller('/brands')
export class BrandController {
  constructor(private brandService: BrandService) {}

  @Get()
  getAllBrands() {
    return this.brandService.getAll();
  }

  @Get('/:id')
  async getBrandById(@Param('id') id: string) {
    const brand = await this.brandService.getById(id);
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  @Post()
  async createBrand(@Body() data: Prisma.BrandCreateInput) {
    return await this.brandService.createBrand(data);
  }

  @Patch('/:id')
  async updateBrand(
    @Param('id') id: string,
    @Body() data: Prisma.BrandUpdateInput,
  ) {
    const brand = await this.brandService.updateBrand(id, data);
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  @Delete('/:id')
  async deleteBrand(@Param('id') id: string) {
    const brand = await this.brandService.deleteBrand(id);
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }
}
