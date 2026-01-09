import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get('health')
  async checkHealth() {
    await this.cacheManager.set('health_check', 'ok', 1000);
    const value = await this.cacheManager.get('health_check');
    return {
      status: 'up',
      cache: value === 'ok' ? 'working' : 'failed',
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  getData() {
    return this.appService.getData();
  }
}
