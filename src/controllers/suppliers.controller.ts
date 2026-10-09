/**
 * ARCHIVO: suppliers.controller.ts
 * DESCRIPCIÓN: Controlador para manejar rutas HTTP relacionadas con proveedores.
 * FUNCIONALIDAD:
 *   - Define las rutas HTTP (endpoints) para operaciones con proveedores
 *   - Recibe solicitudes HTTP y las delega al servicio correspondiente
 *   - Valida los datos usando DTOs antes de procesarlos
 *   - Rutas disponibles: POST /suppliers (crear proveedor)
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
import type { Prisma } from 'generated/prisma/client';
import { SuppliersService } from '../services/suppliers.service';

@Controller('/suppliers')
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  @Get()
  getAllSuppliers() {
    return this.suppliersService.getAllSuppliers();
  }

  @Get('/:id')
  async getSupplier(@Param('id') id: string) {
    const supplier = await this.suppliersService.getSupplier(id);
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  @Post()
  createSupplier(@Body() supplierData: Prisma.SupplierCreateInput) {
    return this.suppliersService.createSupplier(supplierData);
  }

  @Patch('/:id')
  async updateSupplier(
    @Param('id') id: string,
    @Body() supplierData: Prisma.SupplierUpdateInput,
  ) {
    const supplier = await this.suppliersService.updateSupplier(
      id,
      supplierData,
    );
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  @Delete('/:id')
  async deleteSupplier(@Param('id') id: string) {
    const supplier = await this.suppliersService.deleteSupplier(id);
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }
}
