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
