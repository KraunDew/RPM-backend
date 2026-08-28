/**
 * ARCHIVO: suppliers.controller.ts
 * DESCRIPCIÓN: Controlador para manejar rutas HTTP relacionadas con proveedores.
 * FUNCIONALIDAD:
 *   - Define las rutas HTTP (endpoints) para operaciones con proveedores
 *   - Recibe solicitudes HTTP y las delega al servicio correspondiente
 *   - Valida los datos usando DTOs antes de procesarlos
 *   - Rutas disponibles: POST /suppliers (crear proveedor)
 */

import { Body, Controller, Post } from '@nestjs/common';
import { SupplierDto } from './dto/supplier.dto';
import { SuppliersService } from './suppliers.service';

@Controller('/suppliers')
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}
  @Post()
  createSupplier(@Body() supplierData: SupplierDto) {
    return this.suppliersService.createSupplier(supplierData);
  }
}
