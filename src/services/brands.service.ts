import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BrandService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return await this.prisma.brand.findMany();
  }

  async getById(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id_brand: id },
    });

    if (!brand) return null;

    return brand;
  }

  async createBrand(data: Prisma.BrandCreateInput) {
    return await this.prisma.brand.create({ data });
  }

  async updateBrand(id: string, data: Prisma.BrandUpdateInput) {
    const brand = await this.prisma.brand.findUnique({
      where: { id_brand: id },
    });
    if (!brand) return null;

    return await this.prisma.brand.update({
      where: { id_brand: id },
      data,
    });
  }

  async deleteBrand(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id_brand: id },
    });
    if (!brand) return null;

    return await this.prisma.brand.delete({
      where: { id_brand: id },
    });
  }
}
