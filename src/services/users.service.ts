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

import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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

  async getAuthenticatedUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id_user: userId,
      },
      select: {
        id_user: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('El usuario autenticado ya no existe.');
    }

    return user;
  }

  async createUser(user: Prisma.UserCreateInput) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: user.email },
        select: { id_user: true },
      });

      if (existingUser) {
        throw new HttpException(
          'Este correo electrónico ya está registrado.',
          HttpStatus.CONFLICT,
        );
      }

      const password = await argon2.hash(user.password);
      const birthDate = new Date(user.birthDate as string);

      const newUser = {
        ...user,
        password,
        birthDate,
      };

      await this.prisma.user.create({
        data: newUser,
      });

      return await this.loginUser(user.email, user.password);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new HttpException(
          'Este correo electrónico ya está registrado.',
          HttpStatus.CONFLICT,
        );
      }

      console.error('Error creando usuario:', error);
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
      role: user.role,
    });
    const { email: userEmail, phone_number, password, id_user, ...info } = user;

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

  async deleteUser(id_user: string) {
    const deletedUser = await this.prisma.user.deleteMany({
      where: { id_user },
    });
    if (!deletedUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }
}
