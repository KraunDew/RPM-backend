/**
 * ARCHIVO: orderSchema.ts
 * DESCRIPCIÓN: Esquema de MongoDB para órdenes.
 * FUNCIONALIDAD:
 *   - Define la estructura de datos de una orden en la base de datos
 *   - Especifica los campos requeridos: userId, date y details
 *   - Utiliza Mongoose para mapear objetos JavaScript a documentos MongoDB
 */

import { Prop, Schema } from '@nestjs/mongoose';
import { detailOrder } from './detailSchema';

@Schema()
export class Order {
  @Prop({
    type: String,
    required: true,
  })
  userId!: string;

  @Prop({
    type: String,
    required: true,
  })
  date!: string;

  @Prop({
    type: [detailOrder],
    required: true,
  })
  details!: detailOrder[];
}
