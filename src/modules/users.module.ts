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
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from 'src/prisma/prisma.module';
<<<<<<< HEAD
<<<<<<< HEAD:src/modules/users.module.ts
=======
>>>>>>> 2763678 (ruta - controlador - modelo - vista)
import { usersController } from '../controllers/users.controller';
import { JwtGuard } from '../guards/jwt.guard';
import { usersService } from '../services/users.service';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { LocalStrategy } from '../strategies/local.strategy';
<<<<<<< HEAD
=======
import { JwtGuard } from './guards/jwt.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { usersController } from './users.controller';
import { usersService } from './users.service';
>>>>>>> 44fe590 (Update of database, change to Postgres):src/users/users.module.ts
=======
>>>>>>> 2763678 (ruta - controlador - modelo - vista)

@Module({
  imports: [
    PrismaModule,
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
