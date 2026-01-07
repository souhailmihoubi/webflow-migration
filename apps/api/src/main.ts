/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './app/common/logging/winston.config';
import { HttpLoggingInterceptor } from './app/common/logging/http-logging.interceptor';
import { AllExceptionsFilter } from './app/common/logging/all-exceptions.filter';
import { HttpAdapterHost } from '@nestjs/core';

import compression from 'compression';
import helmet from 'helmet';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });

  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  app.useGlobalInterceptors(new HttpLoggingInterceptor());

  // Enable compression
  app.use(compression());

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }),
  );

  // Request size limits
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw error on unknown properties
      transform: true, // Auto-transform to DTO types
    }),
  );

  // Enable CORS for frontend
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:4200',
      'https://www.lartistou.com',
      'https://lartistou.com',
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
