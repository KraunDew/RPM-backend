/**
 * ARCHIVO: userSchema.ts
 * DESCRIPCIÓN: Esquema de MongoDB para usuarios.
 * FUNCIONALIDAD:
 *   - Define la estructura de datos de un usuario en la base de datos
 *   - Incluye información personal (nombre, apellido, email, contraseña)
 *   - Contiene datos de contacto (teléfono, RUT) y dirección
 *   - Valida que email y RUT sean únicos en el sistema
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Address } from './addressSchema';

@Schema()
export class User {
  @Prop({ type: String, required: true })
  firstName!: string;

  @Prop({ type: String })
  lastName?: string;

  @Prop({ type: String, required: true, unique: true })
  email!: string;

  @Prop({ type: String, required: true })
  password!: string;

  @Prop({ type: String })
  phone?: string;

  @Prop({ type: String, unique: true })
  rut?: string;

  @Prop({ type: Address })
  address?: Address;

  @Prop({ type: String })
  birthDate?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
