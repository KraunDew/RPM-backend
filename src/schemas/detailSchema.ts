/**
 * ARCHIVO: detailSchema.ts
 * DESCRIPCIÓN: Esquema de MongoDB para detalles de órdenes.
 * FUNCIONALIDAD:
 *   - Define la estructura de cada ítem dentro de una orden
 *   - Contiene referencia al producto (productId) y cantidad (amount)
 *   - Se usa como sub-documento dentro del esquema de órdenes
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class detailOrder {
  @Prop({
    type: String,
    require: true,
  })
  productId!: string;

  @Prop({
    type: Number,
    required: true,
    default: 1,
  })
  amount!: number;
}
export const detailOrderSchema = SchemaFactory.createForClass(detailOrder);
