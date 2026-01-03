import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CatalogService } from './catalog.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateProductDto,
  UpdateProductDto,
} from '@my-org/api-interfaces';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  // ========== Categories ========== @Get('categories')
  getAllCategories() {
    return this.catalogService.getAllCategories();
  }

  @Get('categories/:id')
  getCategoryById(@Param('id') id: string) {
    return this.catalogService.getCategoryById(id);
  }

  @Get('categories/slug/:slug')
  getCategoryBySlug(@Param('slug') slug: string) {
    return this.catalogService.getCategoryBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('categories')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.catalogService.createCategory(dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put('categories/:id')
  updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.catalogService.updateCategory(id, dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.catalogService.deleteCategory(id);
  }

  // ========== Products ==========

  @Get('products')
  getAllProducts(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('visible') visible?: string,
  ) {
    return this.catalogService.getAllProducts({
      search,
      categoryId,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      visible:
        visible === 'true' ? true : visible === 'false' ? false : undefined,
    });
  }

  @Get('products/:id')
  getProductById(@Param('id') id: string) {
    return this.catalogService.getProductById(id);
  }

  @Get('products/slug/:slug')
  getProductBySlug(@Param('slug') slug: string) {
    return this.catalogService.getProductBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('products')
  createProduct(@Body() dto: CreateProductDto) {
    return this.catalogService.createProduct(dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put('products/:id')
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.catalogService.updateProduct(id, dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete('products/:id')
  deleteProduct(@Param('id') id: string) {
    return this.catalogService.deleteProduct(id);
  }
}
