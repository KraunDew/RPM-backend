/**
 * ARCHIVO: suppliers.service.ts
 * DESCRIPCIÓN: Servicio que contiene la lógica de negocio para proveedores.
 *
 * FUNCIONALIDAD:
 * - Crear, actualizar, eliminar y recuperar proveedores.
 * - Incluir las direcciones relacionadas con cada proveedor.
 * - Crear la dirección al registrar un proveedor.
 * - Actualizar la dirección al editar un proveedor.
 * - Interactuar con PostgreSQL mediante Prisma.
 */

import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

type SupplierAddressInput = {
  street: string;
  house_number: string;
  department?: string | null;
  block?: string | null;
  comune: string;
  region: string;
  reference?: string | null;
};

type CreateSupplierInput = Omit<Prisma.SupplierCreateInput, 'address'> & {
  address?: SupplierAddressInput;
};

type UpdateSupplierInput = Omit<Prisma.SupplierUpdateInput, 'address'> & {
  address?: SupplierAddressInput;
};

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene todos los proveedores junto con sus direcciones.
   */
  async getAllSuppliers() {
    return this.prisma.supplier.findMany({
      include: {
        address: true,
      },
    });
  }

  /**
   * Obtiene un proveedor por su ID, incluyendo sus direcciones
   * y productos asociados.
   */
  async getSupplier(id: string) {
    return this.prisma.supplier.findUnique({
      where: {
        id_supplier: id,
      },
      include: {
        address: true,
        products: true,
      },
    });
  }

  /**
   * Crea un proveedor y, si se entrega una dirección,
   * la guarda como registro relacionado en Prisma.
   */
  async createSupplier(data: CreateSupplierInput) {
    const { address, ...supplierData } = data;

    return this.prisma.supplier.create({
      data: {
        ...supplierData,
        ...(address
          ? {
              address: {
                create: address,
              },
            }
          : {}),
      },
      include: {
        address: true,
      },
    });
  }

  /**
   * Actualiza los datos del proveedor y su dirección.
   *
   * Si ya tiene una dirección, actualiza la primera.
   * Si todavía no tiene ninguna, crea una nueva.
   * Si no se envía address, conserva las direcciones actuales.
   */
  async updateSupplier(id: string, data: UpdateSupplierInput) {
    const { address, ...supplierData } = data;

    const supplier = await this.prisma.supplier.findUnique({
      where: {
        id_supplier: id,
      },
      include: {
        address: true,
      },
    });

    if (!supplier) {
      return null;
    }

    return this.prisma.supplier.update({
      where: {
        id_supplier: id,
      },
      data: {
        ...supplierData,
        ...(address
          ? supplier.address.length > 0
            ? {
                address: {
                  update: {
                    where: {
                      id_address: supplier.address[0].id_address,
                    },
                    data: address,
                  },
                },
              }
            : {
                address: {
                  create: address,
                },
              }
          : {}),
      },
      include: {
        address: true,
      },
    });
  }
  async deleteSupplier(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: {
        id_supplier: id,
      },
    });

    if (!supplier) {
      return null;
    }

    return this.prisma.supplier.delete({
      where: {
        id_supplier: id,
      },
    });
  }
}
