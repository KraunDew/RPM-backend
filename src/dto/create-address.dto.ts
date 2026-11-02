import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @MaxLength(255)
  street: string;

  @IsString()
  @MaxLength(50)
  house_number: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  department?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  block?: string;

  @IsString()
  @MaxLength(100)
  comune: string;

  @IsString()
  @MaxLength(100)
  region: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reference?: string;
}
