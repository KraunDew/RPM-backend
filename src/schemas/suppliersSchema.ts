/**
 * ARCHIVO: suppliersSchema.ts
 * DESCRIPCIÓN: Esquema de MongoDB para proveedores.
 * FUNCIONALIDAD:
 *   - Define la estructura de datos para un proveedor
 *   - Contiene información de contacto (nombre, teléfono, email)
 *   - Incluye relación con direcciones y productos que ofrece
 *   - Se utiliza para gestionar la información de los proveedores en el sistema
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Address } from './addressSchema';
import { Product } from './productSchema';

@Schema()
export class Supplier {
  @Prop({
    type: String,
    required: true,
  })
  name!: string;

  @Prop({
    type: String,
    required: true,
  })
  phone!: string;

  @Prop({
    type: String,
    required: true,
  })
  email!: string;

  @Prop({
    type: Address,
    required: true,
  })
  addres!: Address;

  @Prop({
    type: [Product],
  })
  products?: Product[];
}
export const SupplierSchema = SchemaFactory.createForClass(Supplier);
