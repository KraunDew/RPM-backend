/**
 * ARCHIVO: main.ts
 * DESCRIPCIÓN: Punto de entrada de la aplicación NestJS.
 * FUNCIONALIDAD:
 *   - Inicializa la aplicación usando NestFactory
 *   - Configura pipes de validación global para validar DTOs
 *   - Habilita CORS para permitir peticiones desde cualquier origen
 *   - Inicia el servidor en el puerto definido en .env (por defecto 3000)
 */

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import 'dotenv/config'; // Hace que los archivos .env se puedan leer en todo el proyecto
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //bloquea la plantilla de los DTO
    }),
  );

  app.enableCors(); // Habilita el llamado de la API desde cualquier host.
  await app.listen(process.env.PORT ?? 3000); //Se abre en un puerto del .ENV o por defecto en 3000
}

bootstrap(); // Se ejecuta el programa
