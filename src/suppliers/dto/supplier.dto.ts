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

export class SupplierDto {
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
