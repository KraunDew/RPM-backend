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
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { UserDto } from './dto/user.dto';
import { usersService } from './users.service';

@Controller('/users')
export class usersController {
  constructor(private usersService: usersService) {}

  @Get() // Metodo de llamado en Http
  getAllUsers() {
    return this.usersService.getAllUsers(); // Llamamos a la funcion creada en el servicio
  }

  @Post()
  createUser(@Body() createUser: CreateUserDto) {
    // Hacemos que el Body / formulario se evalue / compare con el Dto, evitando valores o tipos no deseado
    return this.usersService.createUser(createUser); // le damos los valores obtenidos en el Body / Formulario
  }

  @Patch('/:id') // Creamos un parametro llamado id
  updateUser(@Param('id') id: string, @Body() updateUser: UserDto) {
    // Obtenemos el valor del parametro id, y lo que tiene el body / formulario
    return this.usersService.updateUser(id, updateUser); // Y se lo pasamos a la funcion para actualizar el usuario
  }

  @Delete()
  deleteUsers() {
    return this.usersService.deleteUsers();
  }
}
