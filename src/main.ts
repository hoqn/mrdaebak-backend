require("dotenv").config();

import { ValidationPipe } from '@nestjs/common';
import { VersioningType } from '@nestjs/common/enums';
import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';

async function bootstrap() {
  const apiApp = await NestFactory.create(AppModule);
  apiApp.enableVersioning({
    type: VersioningType.URI,
    prefix: 'api/v',
    defaultVersion: '1',
  });
  apiApp.enableCors({
    origin: true,
    credentials: true,
  });
  apiApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );
  apiApp.useWebSocketAdapter(new IoAdapter(apiApp));
  await apiApp.listen(8080);
}
bootstrap();
