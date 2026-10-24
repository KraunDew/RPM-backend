import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { IAService } from './ia.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly iaService: IAService,
  ) {}

  private readonly productRelations = {
    category: true,
    brand: true,
    supplier: true,
  } satisfies Prisma.ProductInclude;

  getAllProducts() {
    return this.prisma.product.findMany({
      include: this.productRelations,
      orderBy: { name: 'asc' },
    });
  }

  getProductById(id: string) {
    return this.prisma.product.findUnique({
      where: { id_product: id },
      include: this.productRelations,
    });
  }

  async createProduct(info: Prisma.ProductCreateInput, photo_path: string) {
    const data: Prisma.ProductCreateInput = {
      ...info,
      photo_path,
    };
    const product = await this.prisma.product.create({
      data,
      include: this.productRelations,
    });

    void this.iaService
      .generateProductEmbedding(product.id_product)
      .catch((error: unknown) => {
        console.error('Error generating product embedding:', error);
      });

    return product;
  }

  async updateProduct(id: string, data: Prisma.ProductUpdateInput) {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id_product: id },
      select: { id_product: true },
    });

    if (!existingProduct) return null;

    const product = await this.prisma.product.update({
      where: { id_product: id },
      data,
      include: this.productRelations,
    });

    void this.iaService.generateProductEmbedding(id).catch((error: unknown) => {
      console.error('Error generating product embedding:', error);
    });

    return product;
  }

  async deleteProduct(id: string) {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id_product: id },
    });

    if (!existingProduct) return null;

    return this.prisma.product.delete({
      where: { id_product: id },
    });
  }
}
