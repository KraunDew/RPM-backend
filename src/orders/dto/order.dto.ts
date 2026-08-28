/**
 * ARCHIVO: order.dto.ts
 * DESCRIPCIÓN: Data Transfer Object para validar datos de órdenes.
 * FUNCIONALIDAD:
 *   - Define la estructura y validación de una orden
 *   - Valida que los datos enviados cumplan con los requisitos (tipo de dato, formato)
 *   - Utiliza class-validator para garantizar la integridad de los datos
 */

import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { DetailOrderDto } from './detailOrder.dto';

export class OrderDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsDateString()
  @IsNotEmpty()
  date!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetailOrderDto)
  details!: DetailOrderDto[];
}
