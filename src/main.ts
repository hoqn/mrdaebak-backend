require("dotenv").config();

import { ValidationPipe } from '@nestjs/common';
import { VersioningType } from '@nestjs/common/enums';
import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';
import { CONFIG } from './config';

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

  const host = process.env.SERVER_HOST ?? CONFIG.server.host ?? 'localhost';
  const port = process.env.SERVER_PORT ?? CONFIG.server.port ?? '3000';
  
  await apiApp.listen(CONFIG.server.port)//, CONFIG.server.host)
    .then(() => {
      console.info(`\n\n[*]  🎅  Mr.Daebak Backend 서버가 http://${host}:${port}에 시작됩니다.\n\n`);
    });

}
bootstrap();
