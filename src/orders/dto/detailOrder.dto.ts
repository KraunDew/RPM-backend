/**
 * ARCHIVO: detailOrder.dto.ts
 * DESCRIPCIÓN: Data Transfer Object para detalles de una orden.
 * FUNCIONALIDAD:
 *   - Define la estructura de cada producto dentro de una orden
 *   - Valida que el productId sea un string y amount sea un número positivo
 *   - Permite campos opcionales para flexibilidad en la creación de órdenes
 */

import { IsOptional, IsPositive, IsString } from 'class-validator';

export class DetailOrderDto {
  @IsString()
  @IsOptional()
  productId?: string;

  @IsPositive()
  @IsOptional()
  amount?: number;
}
