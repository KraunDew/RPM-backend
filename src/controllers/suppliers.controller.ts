/**
 * ARCHIVO: suppliers.controller.ts
 * DESCRIPCIÓN: Controlador para manejar rutas HTTP relacionadas con proveedores.
 * FUNCIONALIDAD:
 *   - Define las rutas HTTP (endpoints) para operaciones con proveedores
 *   - Recibe solicitudes HTTP y las delega al servicio correspondiente
 *   - Valida los datos usando DTOs antes de procesarlos
 *   - Rutas disponibles: POST /suppliers (crear proveedor)
 */

import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { SupplierDto } from './dto/supplier.dto';
import { CreateSupplierDto } from './dto/supplierCreate.dto';
import { SuppliersService } from './suppliers.service';

@Controller('/suppliers')
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  @Get()
  getAllSuppliers() {
    return this.suppliersService.getAllSuppliers();
  }

  @Get('/:id')
  getSupplier(@Param('id') id: string) {
    return this.suppliersService.getSupplier(id);
  }

  @Post()
  createSupplier(@Body() supplierData: CreateSupplierDto) {
    return this.suppliersService.createSupplier(supplierData);
  }

  @Patch('/:id')
  updateSupplier(@Param('id') id: string, @Body() supplierData: SupplierDto) {
    return this.suppliersService.updateSupplier(id, supplierData);
  }
}
