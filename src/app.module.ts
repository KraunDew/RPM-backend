/**
 * ARCHIVO: app.module.ts
 * DESCRIPCIÓN: Módulo raíz de la aplicación.
 * FUNCIONALIDAD:
 *   - Configura la conexión a la base de datos MongoDB usando Mongoose
 *   - Importa todos los módulos principales: UsersModule y SupplierModule
 *   - Centraliza la configuración general de la aplicación
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AddressesModule } from './modules/addresses.module';
import { BrandModule } from './modules/brands.module';
import { CategoriesModule } from './modules/categories.module';
import { IAModule } from './modules/ia.module';
import { OrderModule } from './modules/order.module';
import { ProductsModule } from './modules/products.module';
import { SupplierModule } from './modules/suppliers.module';
import { UsersModule } from './modules/users.module';
import { PaymentsModule } from './payments/payments.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.URL_MONGOODB!), //Busca la URL en el .env para conectarse a la BD
    PrismaModule,
    AddressesModule,
    UsersModule, //Importamos y usamos rutas y funciones de User
    SupplierModule, // Lo mismo con los proveedores
    CategoriesModule,
    BrandModule,
    ProductsModule,
    OrderModule,
    PaymentsModule,
    IAModule,
  ],
})
export class AppModule {}
