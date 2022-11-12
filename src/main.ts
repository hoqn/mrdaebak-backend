require("dotenv").config();

import { ValidationPipe } from '@nestjs/common';
import { VersioningType } from '@nestjs/common/enums';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const apiApp = await NestFactory.create(AppModule);
  apiApp.enableVersioning({
    type: VersioningType.URI,
    prefix: 'api/v',
    defaultVersion: '1',
  });
  apiApp.enableCors();
  apiApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transform: true,
    })
  );
  await apiApp.listen(8080);
}
bootstrap();
