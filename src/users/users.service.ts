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
import argon2 from 'argon2';
import { Model } from 'mongoose';
import { User } from 'src/schemas/userSchema';
import { CreateUserDto } from './dto/createUser.dto';
import { UserDto } from './dto/user.dto';

@Injectable()
export class usersService {
  constructor(@InjectModel('User') private userModel: Model<User>) {} //Llamamos al modelo Usuario

  getAllUsers() {
    return this.userModel.find(); //Devuelve todos los usuarios
  }

  async createUser(user: CreateUserDto) {
    try {
      const password = await argon2.hash(user.password); // hasheo de la contraseña

      const newUser = {
        ...user, // copiamos el usuario
        password, // le cambiamos el parametro de contraseña por la haseada
      };

      const existingUser = await this.userModel.findOne({
        email: newUser.email,
      }); // buscamos si el email esta en uso
      if (existingUser) {
        throw new HttpException('Email already in use', HttpStatus.CONFLICT); // si esta en uso le prohibimos la creación con ese correo
      }

      const createdUser = new this.userModel(newUser); //Guarda un Schema de usuario validado por el Dto

      await createdUser.save(); // El Schema se guarda en la base de datos
      return createdUser.id; // Devolvemos el id del usuario creado
    } catch (error) {
      console.log(`Error creando usuario: ${error}`);
    }
  }

  async loginUser(email: string, password: string) {
    const user = await this.userModel.findOne({ email: email }); // Buscamos el usuario

    if (!user) {
      return new HttpException('Invalid Credentials', HttpStatus.BAD_REQUEST); // Si no se encuntra le decimos credenciales invalidas
    }

    const isValid = await argon2.verify(password, user.password); // validamos la cotraseña con la de la DB

    if (!isValid) {
      return new HttpException('Invalid Credentials', HttpStatus.BAD_REQUEST); // Si no coincide le devolvemos credenciales invalidas
    }

    return new HttpException('Login Succesfully', HttpStatus.OK); // Si pasa todo, le decimos Inicio de Sesion correcto
  }

  async updateUser(id: string, updateUser: UserDto) {
    if (updateUser.password) {
      updateUser.password = await argon2.hash(updateUser.password);
    }
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id, //Buscamos por la ID un usuario
      { $set: updateUser }, // Le actualizamos y/o agregamos esos datos
      { new: true, runValidators: true },
    );
    if (!updatedUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND); // En caso de que no encuentre algun usuario con esa ID tira un 404 Not Found
    }
    return new HttpException('User Updated', HttpStatus.ACCEPTED); // Devolvemos usuario actualizado y un codigo 202(Accepted)
  }

  async deleteUsers() {
    const result = await this.userModel.deleteMany({}); // Elimina TODOS los usuarios
    if (result.deletedCount === 0) {
      throw new HttpException('No users found to delete', HttpStatus.NOT_FOUND); // En caso de no haber usuarios se muestra un 404 y un mensaje de que no hay usuarios
    }
    return new HttpException(
      `${result.deletedCount} users deleted successfully`,
      HttpStatus.OK,
    );
  }
}
