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
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Supplier } from 'src/schemas/suppliersSchema';
import { SupplierDto } from './dto/supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectModel('Supplier') private supplierModel: Model<Supplier>,
  ) {}

  getSupplier(id: string) {
    return this.supplierModel.findById(id);
  }

  async createSupplier(supplierData: SupplierDto) {
    const createdSupplier = new this.supplierModel(supplierData);
    await createdSupplier.save();
    return createdSupplier;
  }
}
