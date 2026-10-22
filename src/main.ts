import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Permite leer las cookies de las solicitudes.
  app.use(cookieParser());

  // Permite peticiones desde tu frontend.

  // Permite leer las cookies de las solicitudes.
  app.use(cookieParser());

  // Permite peticiones desde tu frontend.
  app.enableCors({
    origin: ['https://rpm-proyect.vercel.app', 'http://localhost:4000'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  await app.listen(process.env.PORT!, '0.0.0.0');
}

bootstrap();
