/**
 * ARCHIVO: product.dto.ts
 * DESCRIPCIÓN: Data Transfer Object para validar datos de productos.
 * FUNCIONALIDAD:
 *   - Define la estructura y validación de un producto
 *   - Valida campos como nombre (string), precio (número positivo) y stock (mínimo 0)
 *   - Incluye campos opcionales para modelo, material y descripción
 *   - Se utiliza en el DTO de proveedor para validar productos
 */

import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class ProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;

  @IsString()
  @IsOptional()
  model?: string;

  @IsOptional()
  @IsString()
  material?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
