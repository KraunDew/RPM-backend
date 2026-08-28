/**
 * ARCHIVO: users.module.ts
 * DESCRIPCIÓN: Módulo de NestJS para el manejo de usuarios.
 * FUNCIONALIDAD:
 *   - Configura el esquema de usuario en MongoDB
 *   - Organiza y exporta el controlador y servicio de usuarios
 *   - Establece las dependencias necesarias (MongooseModule, controlador, servicio)
 *   - Se importa en el módulo raíz (app.module.ts)
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/schemas/userSchema';
import { usersController } from './users.controller';
import { usersService } from './users.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])], //Conectamos la base de datos con el Schema de User
  controllers: [usersController], // Llamamos los controladores
  providers: [usersService], // Llamamos los servicios
})
export class UsersModule {}
