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

@Injectable()
export class SuppliersService {
  constructor() {}

  getAllSuppliers() {
    return true;
  }

  getSupplier(id: string) {
    return id;
  }

  createSupplier(supplierData: any) {
    return supplierData;
  }

  updateSupplier(id: string, supplierData: any) {
    return { id, supplierData };
  }

  deleteSupplier(id: string) {
    return id;
  }
}
