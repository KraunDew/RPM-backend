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
import { ProductsService } from 'src/services/products.service';

@Controller('/products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  getAllProducts() {
    return this.productsService.getAllProducts();
  }

  @Get('/:id')
  async getProduct(@Param('id') id: string) {
    const product = await this.productsService.getProductById(id);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  @Post()
  async createProduct(@Body() data: Prisma.ProductCreateInput) {
    return await this.productsService.createProduct(data);
  }

  @Patch('/:id')
  async updateProduct(
    @Param('id') id: string,
    @Body() data: Prisma.ProductUpdateInput,
  ) {
    const product = await this.productsService.updateProduct(id, data);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  @Delete('/:id')
  async deleteProduct(@Param('id') id: string) {
    const product = await this.productsService.deleteProduct(id);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }
}
