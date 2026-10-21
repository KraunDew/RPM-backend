/**
 * ARCHIVO: suppliers.controller.ts
 * DESCRIPCIÓN: Controlador para manejar las rutas HTTP de proveedores.
 */

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

import { SuppliersService } from '../services/suppliers.service';

type SupplierAddressInput = {
  street: string;
  house_number: string;
  department?: string | null;
  block?: string | null;
  comune: string;
  region: string;
  reference?: string | null;
};

type CreateSupplierInput = {
  name: string;
  email: string;
  phone_number: string;
  address?: SupplierAddressInput;
};

type UpdateSupplierInput = Partial<CreateSupplierInput>;

@Controller('/suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  getAllSuppliers() {
    return this.suppliersService.getAllSuppliers();
  }

  @Get('/:id')
  async getSupplier(@Param('id') id: string) {
    const supplier = await this.suppliersService.getSupplier(id);

    if (!supplier) {
      throw new NotFoundException('Proveedor no encontrado');
    }

    return supplier;
  }

  @Post()
  createSupplier(@Body() supplierData: CreateSupplierInput) {
    return this.suppliersService.createSupplier(supplierData);
  }

  @Patch('/:id')
  async updateSupplier(
    @Param('id') id: string,
    @Body() supplierData: UpdateSupplierInput,
  ) {
    const supplier = await this.suppliersService.updateSupplier(
      id,
      supplierData,
    );

    if (!supplier) {
      throw new NotFoundException('Proveedor no encontrado');
    }

    return supplier;
  }

  @Delete('/:id')
  async deleteSupplier(@Param('id') id: string) {
    const supplier = await this.suppliersService.deleteSupplier(id);

    if (!supplier) {
      throw new NotFoundException('Proveedor no encontrado');
    }

    return supplier;
  }
}
