/**
 * ARCHIVO: suppliers.module.ts
 * DESCRIPCIÓN: Módulo de NestJS para el manejo de proveedores.
 * FUNCIONALIDAD:
 *   - Organiza y exporta el controlador y servicio de proveedores
 *   - Establece las dependencias necesarias para funcionar
 *   - Se importa en el módulo raíz (app.module.ts)
 */

import { Module } from '@nestjs/common';
<<<<<<< HEAD:src/modules/suppliers.module.ts
import { SuppliersController } from '../controllers/suppliers.controller';
import { SuppliersService } from '../services/suppliers.service';
=======
import { MongooseModule } from '@nestjs/mongoose';
import { SupplierSchema } from 'src/schemas/suppliersSchema';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';
>>>>>>> 687602f (logica de creacion de proveedores hecha):src/suppliers/suppliers.module.ts

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Supplier', schema: SupplierSchema }]),
  ],
  controllers: [SuppliersController],
  providers: [SuppliersService],
})
export class SupplierModule {}
