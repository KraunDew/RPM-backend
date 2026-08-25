import { Injectable } from '@nestjs/common';
import { SupplierDto } from './dto/supplier.dto';

@Injectable()
export class SuppliersService {
  createSupplier(supplierData: SupplierDto): any {
    console.log('Creating supplier:', supplierData);
  }
}
