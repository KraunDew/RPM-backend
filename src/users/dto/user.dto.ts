/**
 * ARCHIVO: user.dto.ts
 * DESCRIPCIÓN: Data Transfer Object para validar datos de usuarios.
 * FUNCIONALIDAD:
 *   - Define la estructura y validación de un usuario
 *   - Valida campos como email (formato válido), contraseña (fuerte)
 *   - Incluye validación de teléfono (formato chileno: +56912345678)
 *   - Permite campos opcionales para flexibilidad
 *   - Valida RUT chileno, fecha de nacimiento y dirección
 *   - Se utiliza para validar datos entrantes en solicitudes POST/PATCH
 */

import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  ValidateNested,
} from 'class-validator';
import { AddressDto } from './address.dto';

export class UserDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @IsStrongPassword()
  password?: string;

  @IsString()
  @IsOptional()
  rut?: string; //12345678-k

  @IsString()
  @IsOptional()
  @IsPhoneNumber('CL')
  phone?: string; //+56912345678

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto; //address.dtoo.ts

  @IsOptional()
  @IsDateString()
  birthDate?: string; //2009-20-02 -> AAAA-DD-MM
}
