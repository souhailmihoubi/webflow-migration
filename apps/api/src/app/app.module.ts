import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { EmailModule } from './email/email.module';
import { CatalogModule } from './catalog/catalog.module';
import { OrderModule } from './order/order.module';
import { UploadModule } from './upload/upload.module';
import { AdminModule } from './admin/admin.module';
import { PackModule } from './pack/pack.module';
import { ContactModule } from './contact/contact.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './common/logging/winston.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisHost = configService.get<string>('REDIS_HOST');
        // Only use Redis if a host is provided and it is NOT localhost (unless you really have local redis in dev, but for prod container it fails)
        // For App Runner, 'localhost' implies the container itself, which has no Redis.
        if (redisHost && redisHost !== 'localhost') {
          return {
            store: redisStore,
            host: redisHost,
            port: 6379,
            ttl: 600,
          };
        }
        // Fallback to memory cache
        return {
          ttl: 600,
        };
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 300, // 300 requests per ttl
      },
    ]),
    DatabaseModule,
    EmailModule,
    AuthModule,
    CatalogModule,
    OrderModule,
    UploadModule,
    AdminModule,
    PackModule,
    ContactModule,
    WinstonModule.forRoot(winstonConfig),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
