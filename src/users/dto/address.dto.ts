import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddressDto {
  @IsString()
  @IsNotEmpty()
  street!: string;

  @IsString()
  @IsNotEmpty()
  region!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  commune!: string;

  @IsString()
  @IsNotEmpty()
  zip!: string;

  @IsString()
  @IsNotEmpty()
  houseNumber!: string;

  @IsString()
  @IsOptional()
  block?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
