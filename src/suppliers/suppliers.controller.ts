import { Body, Controller, Post } from '@nestjs/common';
import { SupplierDto } from './dto/supplier.dto';
import { SuppliersService } from './suppliers.service';

@Controller('/suppliers')
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}
  @Post()
  createSupplier(@Body() supplierData: SupplierDto) {
    return this.suppliersService.createSupplier(supplierData);
  }
}
