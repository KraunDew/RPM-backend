import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { IAService } from './ia.service';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private iaService: IAService,
  ) {}

  getAllProducts() {
    return this.prisma.product.findMany();
  }

  async getProductById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id_product: id },
    });
    if (!product) return null;
    return product;
  }

  async createProduct(data: Prisma.ProductCreateInput) {
    const product = await this.prisma.product.create({ data });
    try {
      await this.iaService.generateProductEmbedding(product.id_product);
    } catch (error) {
      console.log('Error generating product embedding:', error);
    }
  }

  async updateProduct(id: string, data: Prisma.ProductUpdateInput) {
    const product = await this.prisma.product.findUnique({
      where: { id_product: id },
    });
    if (!product) return null;
    const updatedProduct = await this.prisma.product.update({
      where: { id_product: id },
      data,
    });

    try {
      await this.iaService.generateProductEmbedding(id);
    } catch (error) {
      console.log('Error generating product embedding:', error);
    }

    return updatedProduct;
  }

  async deleteProduct(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id_product: id },
    });
    if (!product) return null;
    return await this.prisma.product.delete({
      where: { id_product: id },
    });
  }
}
