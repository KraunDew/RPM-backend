import { IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class DetailOrderDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsPositive()
  @IsNotEmpty()
  quantity!: number;
}
