/**
 * ARCHIVO: suppliers.service.ts
 * DESCRIPCIÓN: Servicio que contiene la lógica de negocio para proveedores.
 * FUNCIONALIDAD:
 *   - Implementa las operaciones relacionadas con proveedores
 *   - Se encarga de crear, actualizar, eliminar y recuperar proveedores
 *   - Interactúa con la base de datos a través de Mongoose
 *   - Es utilizado por el controlador para procesar las solicitudes HTTP
 */

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Supplier } from 'src/schemas/suppliersSchema';
import { SupplierDto } from './dto/supplier.dto';
import { CreateSupplierDto } from './dto/supplierCreate.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectModel('Supplier') private supplierModel: Model<Supplier>,
  ) {}

  getAllSuppliers() {
    return this.supplierModel.find();
  }

  getSupplier(id: string) {
    return this.supplierModel.findById(id);
  }

  async createSupplier(supplierData: CreateSupplierDto) {
    try {
      const createdSupplier = new this.supplierModel(supplierData);
      await createdSupplier.save();
      return createdSupplier;
    } catch (error) {
      console.log('Error al crear proveedor:', error);
    }
  }

  async updateSupplier(id: string, supplierData: SupplierDto) {
    try {
      const updatedSupplier = await this.supplierModel.findByIdAndUpdate(
        id,
        { $set: supplierData },
        { new: true, runValidators: true },
      );

      if (!updatedSupplier) {
        return new HttpException('Supplier Not Found', HttpStatus.NOT_FOUND);
      }
      return new HttpException('Supplier Updated', HttpStatus.ACCEPTED);
    } catch (error) {
      console.log(`Error al actualizar el proveedor: ${error}`);
    }
  }

  async deleteSupplier(id: string) {
    try {
      const supplierDeleted = await this.supplierModel.findByIdAndDelete(id);

      if (!supplierDeleted) {
        return new HttpException('Supplier Not Found', HttpStatus.NOT_FOUND);
      }
      return new HttpException(
        'Supplier Deleted Succesfully',
        HttpStatus.ACCEPTED,
      );
    } catch (error) {
      console.log('Error al borrar el proveedor:', error);
    }
  }
}
