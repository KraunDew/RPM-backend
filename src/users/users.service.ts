/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import argon2 from 'argon2';
import { Model } from 'mongoose';
import { User } from 'src/schemas/userSchema';
import { CreateUserDto } from './dto/createUser.dto';
import { UserDto } from './dto/user.dto';

@Injectable()
export class usersService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    private jwtService: JwtService,
  ) {} //Llamamos al MongoDB -> documento -> Usuario

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
        return null;
      }

      const createdUser = new this.userModel(newUser); //Guarda un Schema de usuario validado por el Dto
      await createdUser.save(); // El Schema se guarda en la base de datos

      return await this.loginUser(user.email, user.password);
    } catch (error) {
      console.log(`Error creando usuario: ${error}`);
      throw error;
    }
  }

  async loginUser(email: string, pass: string) {
    const user = await this.userModel.findOne({ email }).lean(); // Buscamos el usuario

    if (!user) {
      return null; // Si no se encuntra le decimos credenciales invalidas
    }

    const isValid = await argon2.verify(user.password, pass); // validamos la cotraseña con la de la DB

    if (!isValid) {
      return null; // Si no coincide le devolvemos credenciales invalidas
    }

    const token = this.jwtService.sign({
      id: user._id,
      email: user.email,
    });
    const { password, ...info } = user;

    return { token, info };
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
