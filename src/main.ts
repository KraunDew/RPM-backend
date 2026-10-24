import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Permite leer las cookies de las solicitudes.
  app.use(cookieParser());
  app.useStaticAssets(join(process.cwd(), 'public'), {
    prefix: '/public/',
  });
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
