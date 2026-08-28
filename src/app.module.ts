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
import { SupplierModule } from './suppliers/suppliers.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.URL_MONGOODB ?? ''), //Busca la URL en el .env para conectarse a la BD
    UsersModule, //Importamos y usamos rutas y funciones de User
    SupplierModule, // Lo mismo con los proveedores
  ],
})
export class AppModule {}
