/**
 * ARCHIVO: supplier.dto.ts
 * DESCRIPCIÓN: Data Transfer Object para validar datos de proveedores.
 * FUNCIONALIDAD:
 *   - Define la estructura y validación de un proveedor
 *   - Valida campos como nombre, teléfono, email y dirección
 *   - Permite incluir un array de productos ofrecidos por el proveedor
 *   - Utiliza class-validator para garantizar la integridad de los datos
 */

import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { AddressDto } from '../../users/dto/address.dto';
import { ProductDto } from './product.dto';

export class CreateSupplierDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('CL')
  phone!: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address!: AddressDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  products?: ProductDto[];
}
