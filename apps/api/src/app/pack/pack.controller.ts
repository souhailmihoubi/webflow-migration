import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { PackService } from './pack.service';
import { CreatePackDto, UpdatePackDto } from '@my-org/api-interfaces';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller()
@UseInterceptors(CacheInterceptor)
export class PackController {
  constructor(private packService: PackService) {}

  // Public endpoints
  @Get('catalog/packs')
  getAllPacks(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.packService.getAllPacks(page ? +page : 1, limit ? +limit : 10);
  }

  @Get('catalog/packs/:slug')
  getPackBySlug(@Param('slug') slug: string) {
    return this.packService.getPackBySlug(slug);
  }

  // Admin endpoints
  @Get('admin/packs')
  @UseGuards(JwtAuthGuard, AdminGuard)
  getAdminPacks(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.packService.getAdminPacks(
      page ? +page : 1,
      limit ? +limit : 10,
      search,
    );
  }

  @Post('admin/packs')
  @UseGuards(JwtAuthGuard, AdminGuard)
  createPack(@Body() dto: CreatePackDto) {
    return this.packService.createPack(dto);
  }

  @Put('admin/packs/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  updatePack(@Param('id') id: string, @Body() dto: UpdatePackDto) {
    return this.packService.updatePack(id, dto);
  }

  @Delete('admin/packs/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  deletePack(@Param('id') id: string) {
    return this.packService.deletePack(id);
  }
}
