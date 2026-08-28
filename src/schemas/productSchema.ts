/**
 * ARCHIVO: productSchema.ts
 * DESCRIPCIÓN: Esquema de MongoDB para productos.
 * FUNCIONALIDAD:
 *   - Define la estructura de datos para un producto
 *   - Incluye información como nombre, precio, stock, modelo, material y descripción
 *   - Se utiliza para almacenar productos asociados a proveedores
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Product {
  @Prop({
    type: String,
    required: true,
  })
  name!: string;

  @Prop({
    type: Number,
    required: true,
  })
  price!: number;

  @Prop({
    type: Number,
    required: true,
    default: 0,
  })
  stock!: number;

  @Prop({
    type: String,
    required: true,
  })
  model!: string;

  @Prop({
    type: String,
  })
  material?: string;

  @Prop({
    type: String,
  })
  description?: string;
}
export const ProductSchema = SchemaFactory.createForClass(Product);
