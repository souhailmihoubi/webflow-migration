import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
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

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    DatabaseModule,
    EmailModule,
    AuthModule,
    CatalogModule,
    OrderModule,
    UploadModule,
    AdminModule,
    PackModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
