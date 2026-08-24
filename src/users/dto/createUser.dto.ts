import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  ValidateNested,
} from 'class-validator';
import { AddressDto } from './address.dto';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('CL')
  phone!: string; //+56912345678

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password!: string;

  @IsString()
  @IsNotEmpty() // Hay que hacer un validador de rut, no hay en el mercado, para evitar el uso de cualquier texto
  rut!: string; //12345678-k

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto; //address.dtoo.ts

  @IsOptional()
  @IsDateString()
  birthDate?: string; //2009-20-02 -> AAAA-DD-MM
}
