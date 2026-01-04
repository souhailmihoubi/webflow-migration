import { Module } from '@nestjs/common';
import { PackService } from './pack.service';
import { PackController } from './pack.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [PackController],
  providers: [PackService],
  exports: [PackService],
})
export class PackModule {}
