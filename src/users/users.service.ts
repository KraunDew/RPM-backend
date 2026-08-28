/**
 * ARCHIVO: users.service.ts
 * DESCRIPCIÓN: Servicio que contiene la lógica de negocio para usuarios.
 * FUNCIONALIDAD:
 *   - Implementa operaciones CRUD (crear, leer, actualizar, eliminar) de usuarios
 *   - Interactúa con la base de datos MongoDB a través del modelo de Usuario
 *   - Maneja validaciones y excepciones HTTP
 *   - Métodos principales:
 *     - getAllUsers(): Obtiene todos los usuarios
 *     - createUser(): Crea un nuevo usuario
 *     - updateUser(): Actualiza datos de un usuario existente
 *     - deleteUsers(): Elimina usuarios
 */

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/userSchema';
import type { UserDto } from './dto/user.dto';

@Injectable()
export class usersService {
  constructor(@InjectModel('User') private userModel: Model<User>) {} //Llamamos al modelo Usuario

  getAllUsers() {
    return this.userModel.find(); //Devuelve todos los usuarios
  }

  async createUser(user: UserDto) {
    const createdUser = new this.userModel(user); //Guarda un Schema de usuario validado por el Dto
    await createdUser.save(); // El Schema se guarda en la base de datos
    return createdUser; // Devolvemos el objeto del usuario creado
  }

  async updateUser(id: string, updateUser: UserDto) {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id, //Buscamos por la ID un usuario
      { $set: updateUser }, // Le actualizamos y/o agregamos esos datos
      { new: true, runValidators: true },
    );
    if (!updatedUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND); // En caso de que no encuentre algun usuario con esa ID tira un 404 Not Found
    }
    return new HttpException(updatedUser, HttpStatus.ACCEPTED); // Devolvemos el usuario actualizado y un codigo 202(Accepted)
  }

  async deleteUsers() {
    const result = await this.userModel.deleteMany({}); // Elimina TODOS los usuarios
    if (result.deletedCount === 0) {
      throw new HttpException('No users found to delete', HttpStatus.NOT_FOUND); // En caso de no haber usuarios se muestra un 404 y un mensaje de que no hay usuarios
    }
    return new HttpException(
      { message: `${result.deletedCount} users deleted successfully` },
      HttpStatus.OK,
    );
  }
}
