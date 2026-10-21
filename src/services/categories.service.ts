import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return await this.prisma.category.findMany();
  }

  async getById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id_category: id },
    });

    if (!category) return null;

    return category;
  }

  async createCategory(data: Prisma.CategoryCreateInput) {
    return await this.prisma.category.create({ data });
  }

  async updateCategory(id: string, data: Prisma.CategoryUpdateInput) {
    const category = await this.prisma.category.findUnique({
      where: { id_category: id },
    });
    if (!category) return null;

    return await this.prisma.category.update({
      where: { id_category: id },
      data,
    });
  }

  async deleteCategory(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id_category: id },
    });
    if (!category) return null;

    return await this.prisma.category.delete({
      where: { id_category: id },
    });
  }
}
