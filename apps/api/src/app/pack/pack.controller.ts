import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PackService } from './pack.service';
import { CreatePackDto, UpdatePackDto } from '@my-org/api-interfaces';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller()
export class PackController {
  constructor(private packService: PackService) {}

  // Public endpoints
  @Get('catalog/packs')
  getAllPacks() {
    return this.packService.getAllPacks();
  }

  @Get('catalog/packs/:slug')
  getPackBySlug(@Param('slug') slug: string) {
    return this.packService.getPackBySlug(slug);
  }

  // Admin endpoints
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
