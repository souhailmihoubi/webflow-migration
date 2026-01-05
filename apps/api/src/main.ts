/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './app/common/logging/winston.config';
import { HttpLoggingInterceptor } from './app/common/logging/http-logging.interceptor';
import { AllExceptionsFilter } from './app/common/logging/all-exceptions.filter';
import { HttpAdapterHost } from '@nestjs/core';

import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });

  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  app.useGlobalInterceptors(new HttpLoggingInterceptor());

  // Enable compression
  app.use(compression());

  // Enable CORS for frontend
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:4200',
      'http://localhost:4201',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  await app.listen(process.env.PORT ?? 3000);
  Logger.log(
    `🚀 Application is running on: http://localhost:${process.env.PORT ?? 3000}/${globalPrefix}`,
  );
}

bootstrap();
