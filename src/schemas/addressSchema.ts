/**
 * ARCHIVO: addressSchema.ts
 * DESCRIPCIÓN: Esquema de MongoDB para direcciones.
 * FUNCIONALIDAD:
 *   - Define la estructura de datos para una dirección completa
 *   - Incluye campos como calle, región, ciudad, comuna, código postal
 *   - Se utiliza como sub-documento en otros esquemas (Usuario, Proveedor)
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Address {
  @Prop({ type: String, required: true })
  street!: string;

  @Prop({ type: String, required: true })
  region!: string;

  @Prop({ type: String, required: true })
  city!: string;

  @Prop({ type: String, required: true })
  commune!: string;

  @Prop({ type: String, required: true })
  zip!: string;

  @Prop({ type: String, required: true })
  houseNumber!: string;

  @Prop({ type: String })
  block?: string;

  @Prop({ type: String })
  description?: string;
}
export const AddressSchema = SchemaFactory.createForClass(Address);
