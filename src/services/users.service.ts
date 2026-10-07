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
import argon2 from 'argon2';
import { Prisma, User } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class usersService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {} //Llamamos al MongoDB -> documento -> Usuario

  getAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany(); //Devuelve todos los usuarios
  }

  async createUser(user: Prisma.UserCreateInput) {
    try {
      const password = await argon2.hash(user.password); // hasheo de la contraseña

      const newUser = {
        ...user, // copiamos el usuario
        password, // le cambiamos el parametro de contraseña por la haseada
      };

      const existingUser = await this.prisma.user.findUnique({
        where: { email: user.email },
      });
      if (existingUser) {
        return null;
      }

      await this.prisma.user.create({ data: newUser });

      return await this.loginUser(user.email, user.password);
    } catch (error) {
      console.log(`Error creando usuario: ${error}`);
      throw error;
    }
  }

  async loginUser(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({ where: { email } }); // Buscamos el usuario

    if (!user) {
      return null; // Si no se encuntra le decimos credenciales invalidas
    }

    const isValid = await argon2.verify(user.password, pass); // validamos la cotraseña con la de la DB

    if (!isValid) {
      return null; // Si no coincide le devolvemos credenciales invalidas
    }

    const token = this.jwtService.sign({
      id: user.id_user,
      email: user.email,
    });
    const { password, id_user, ...info } = user;

    return { token, info };
  }

  async updateUser(id: string, updateUser: Prisma.UserUpdateInput) {
    const data = { ...updateUser };
    if (typeof data.password === 'string') {
      data.password = await argon2.hash(data.password);
    }
    const updatedUser = await this.prisma.user.update({
      where: { id_user: id },
      data,
    });
    if (!updatedUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND); // En caso de que no encuentre algun usuario con esa ID tira un 404 Not Found
    }
    return new HttpException('User Updated', HttpStatus.ACCEPTED); // Devolvemos usuario actualizado y un codigo 202(Accepted)
  }
}
