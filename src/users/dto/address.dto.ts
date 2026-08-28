/**
 * ARCHIVO: address.dto.ts
 * DESCRIPCIÓN: Data Transfer Object para validar datos de direcciones.
 * FUNCIONALIDAD:
 *   - Define la estructura y validación de una dirección
 *   - Incluye campos como calle, región, ciudad, comuna, código postal
 *   - Permite campos opcionales como bloque y descripción
 *   - Se utiliza dentro del DTO de Usuario y Proveedor
 *   - Valida que todos los campos sean strings
 */

import { IsOptional, IsString } from 'class-validator';

export class AddressDto {
  @IsString()
  @IsOptional()
  street?: string;

  @IsString()
  @IsOptional()
  region?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  commune?: string;

  @IsString()
  @IsOptional()
  zip?: string;

  @IsString()
  @IsOptional()
  houseNumber?: string;

  @IsString()
  @IsOptional()
  block?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
