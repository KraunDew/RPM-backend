/**
 * ARCHIVO: suppliers.service.ts
 * DESCRIPCIÓN: Servicio que contiene la lógica de negocio para proveedores.
 * FUNCIONALIDAD:
 *   - Implementa las operaciones relacionadas con proveedores
 *   - Se encarga de crear, actualizar, eliminar y recuperar proveedores
 *   - Interactúa con la base de datos a través de Mongoose
 *   - Es utilizado por el controlador para procesar las solicitudes HTTP
 */

import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  getAllSuppliers() {
    return this.prisma.supplier.findMany();
  }

  async getSupplier(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id_supplier: id },
      include: {
        address: true,
        products: true,
      },
    });

    if (!supplier) {
      return null;
    }

    return supplier;
  }

  async createSupplier(data: Prisma.SupplierCreateInput) {
    return await this.prisma.supplier.create({
      data,
      include: { address: true },
    });
  }

  async updateSupplier(id: string, data: Prisma.SupplierUpdateInput) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id_supplier: id },
    });

    if (!supplier) {
      return null;
    }

    return await this.prisma.supplier.update({
      where: { id_supplier: id },
      data,
    });
  }

  async deleteSupplier(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id_supplier: id },
    });

    if (!supplier) {
      return null;
    }

    return this.prisma.supplier.delete({
      where: { id_supplier: id },
    });
  }
}
