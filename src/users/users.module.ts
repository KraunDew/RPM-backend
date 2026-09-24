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
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { UserSchema } from 'src/schemas/userSchema';
import { JwtGuard } from './guards/jwt.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { usersController } from './users.controller';
import { usersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    PassportModule.register({
      defaultStrategy: 'jwt',
      session: false,
    }),
    JwtModule.register({
      secret: process.env.SECRET_TOKEN,
      signOptions: {
        expiresIn: '15d',
      },
    }),
  ], //Conectamos la base de datos con el Schema de User
  controllers: [usersController], // Llamamos los controladores
  providers: [usersService, LocalStrategy, JwtStrategy, JwtGuard], // Llamamos los servicios
})
export class UsersModule {}
