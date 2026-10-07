/**
 * ARCHIVO: users.controller.ts
 * DESCRIPCIÓN: Controlador para manejar rutas HTTP relacionadas con usuarios.
 * FUNCIONALIDAD:
 *   - Define los endpoints (rutas HTTP) para operaciones CRUD de usuarios
 *   - Recibe solicitudes HTTP y las delega al servicio de usuarios
 *   - Valida los datos de entrada usando el DTO de usuario
 *   - Rutas disponibles:
 *     - GET /users (obtener todos los usuarios)
 *     - POST /users (crear nuevo usuario)
 *     - PATCH /users/:id (actualizar usuario)
 *     - DELETE /users (eliminar usuarios)
 */

import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Prisma } from 'generated/prisma/client';
<<<<<<< HEAD
<<<<<<< HEAD:src/controllers/users.controller.ts
import { LocalGuard } from '../guards/local.guard';
import { usersService } from '../services/users.service';
=======
import { LocalGuard } from './guards/local.guard';
import { usersService } from './users.service';
>>>>>>> 44fe590 (Update of database, change to Postgres):src/users/users.controller.ts
=======
import { LocalGuard } from '../guards/local.guard';
import { usersService } from '../services/users.service';
>>>>>>> 2763678 (ruta - controlador - modelo - vista)

@Controller('/users')
export class usersController {
  constructor(private usersService: usersService) {}

  @Get() // Metodo de llamado en Http
  getAllUsers() {
    return this.usersService.getAllUsers(); // Llamamos a la funcion creada en el servicio
  }

  @Post('/register')
  async createUser(
    @Body() createUser: Prisma.UserCreateInput,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Hacemos que el Body / formulario se evalue / compare con el Dto, evitando valores o tipos no deseado
    const userCreated = await this.usersService.createUser(createUser); // le damos los valores obtenidos en el Body / Formulario

    if (!userCreated) {
      throw new HttpException('Error to register', HttpStatus.CONFLICT);
    }

    const { token, info } = userCreated;

    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // porque estamos en local host
      sameSite: 'lax', // ya que trabajamos en diferentes puertos
    });
    return { messaage: 'Cuenta creada', info };
  }

  @Post('/login')
  @UseGuards(LocalGuard)
  loginUser(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as { token?: string; info?: any };
    res.cookie('token', user.token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });
<<<<<<< HEAD
<<<<<<< HEAD:src/controllers/users.controller.ts
    return { message: 'Sesión iniciada', info: user.info };
=======
    return { message: 'Sesión iniciada', id: user.info };
>>>>>>> 44fe590 (Update of database, change to Postgres):src/users/users.controller.ts
=======
    return { message: 'Sesión iniciada', info: user.info };
>>>>>>> 2763678 (ruta - controlador - modelo - vista)
  }

  @Post('/logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token');
    return { message: 'Sesión cerrada' };
  }

  @Patch('/:id') // Creamos un parametro llamado id
  updateUser(@Param('id') id: string, @Body() data: Prisma.UserUpdateInput) {
    // Obtenemos el valor del parametro id, y lo que tiene el body / formulario
    return this.usersService.updateUser(id, data); // Y se lo pasamos a la funcion para actualizar el usuario
  }
}
