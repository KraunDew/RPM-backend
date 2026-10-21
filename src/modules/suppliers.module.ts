/**
 * ARCHIVO: suppliers.module.ts
 * DESCRIPCIÓN: Módulo de NestJS para el manejo de proveedores.
 * FUNCIONALIDAD:
 *   - Organiza y exporta el controlador y servicio de proveedores
 *   - Establece las dependencias necesarias para funcionar
 *   - Se importa en el módulo raíz (app.module.ts)
 */

import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SuppliersController } from '../controllers/suppliers.controller';
import { SuppliersService } from '../services/suppliers.service';

@Module({
  imports: [PrismaModule],
  controllers: [SuppliersController],
  providers: [SuppliersService],
})
export class SupplierModule {}
