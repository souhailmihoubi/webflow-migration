import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateProductDto,
  UpdateProductDto,
} from '@my-org/api-interfaces';
import { Decimal } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';

@Injectable()
export class CatalogService {
  constructor(private readonly db: DatabaseService) {}

  // ========== Categories ==========

  async createCategory(dto: CreateCategoryDto) {
    const existing = await this.db.category.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException('Category with this slug already exists');
    }

    return this.db.category.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        image: dto.image,
        showInHomePage: dto.showInHomePage ?? false,
      },
    });
  }

  async getAllCategories(search?: string) {
    const where: Prisma.CategoryWhereInput = {};
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    return this.db.category.findMany({
      where,
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCategoryById(id: string) {
    const category = await this.db.category.findUnique({
      where: { id },
      include: {
        products: {
          where: { showInMenu: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async getCategoryBySlug(slug: string) {
    const category = await this.db.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: { showInMenu: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const category = await this.db.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check slug uniqueness if slug is being updated
    if (dto.slug && dto.slug !== category.slug) {
      const existing = await this.db.category.findUnique({
        where: { slug: dto.slug },
      });
      if (existing) {
        throw new ConflictException('Category with this slug already exists');
      }
    }

    return this.db.category.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.slug && { slug: dto.slug }),
        ...(dto.image !== undefined && { image: dto.image }),
        ...(dto.showInHomePage !== undefined && {
          showInHomePage: dto.showInHomePage,
        }),
      },
    });
  }

  async deleteCategory(id: string) {
    const category = await this.db.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category._count.products > 0) {
      throw new ConflictException(
        'Cannot delete category with existing products',
      );
    }

    await this.db.category.delete({
      where: { id },
    });

    return { message: 'Category deleted successfully' };
  }

  // ========== Products ==========

  async createProduct(dto: CreateProductDto) {
    const existing = await this.db.product.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException('Product with this slug already exists');
    }

    // Verify category exists
    const category = await this.db.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.db.product.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        mainImage: dto.mainImage,
        multiImages: dto.multiImages || [],
        priceDetails: dto.priceDetails,
        productDescription: dto.productDescription,
        caracteristiques: dto.caracteristiques,
        price: new Decimal(dto.price),
        discountPrice: dto.discountPrice
          ? new Decimal(dto.discountPrice)
          : null,
        showInMenu: dto.showInMenu ?? true,
        videoLink: dto.videoLink,
        categoryId: dto.categoryId,
      },
      include: {
        category: true,
      },
    });
  }

  async getAllProducts(filters?: {
    search?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    visible?: boolean;
  }) {
    const where: Prisma.ProductWhereInput = {};

    // Search by name or description
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        {
          productDescription: { contains: filters.search, mode: 'insensitive' },
        },
      ];
    }

    // Filter by category
    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    // Filter by visibility
    if (filters?.visible !== undefined) {
      where.showInMenu = filters.visible;
    }

    // Filter by price range
    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.price = {};
      if (filters?.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters?.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    return this.db.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProductById(id: string) {
    const product = await this.db.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async getProductBySlug(slug: string) {
    const product = await this.db.product.findUnique({
      where: { slug },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    const product = await this.db.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check slug uniqueness if slug is being updated
    if (dto.slug && dto.slug !== product.slug) {
      const existing = await this.db.product.findUnique({
        where: { slug: dto.slug },
      });
      if (existing) {
        throw new ConflictException('Product with this slug already exists');
      }
    }

    // Verify category exists if categoryId is being updated
    if (dto.categoryId) {
      const category = await this.db.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    return this.db.product.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.slug && { slug: dto.slug }),
        ...(dto.mainImage && { mainImage: dto.mainImage }),
        ...(dto.multiImages !== undefined && { multiImages: dto.multiImages }),
        ...(dto.priceDetails !== undefined && {
          priceDetails: dto.priceDetails,
        }),
        ...(dto.productDescription && {
          productDescription: dto.productDescription,
        }),
        ...(dto.caracteristiques !== undefined && {
          caracteristiques: dto.caracteristiques,
        }),
        ...(dto.price !== undefined && { price: new Decimal(dto.price) }),
        ...(dto.discountPrice !== undefined && {
          discountPrice: dto.discountPrice
            ? new Decimal(dto.discountPrice)
            : null,
        }),
        ...(dto.showInMenu !== undefined && { showInMenu: dto.showInMenu }),
        ...(dto.videoLink !== undefined && { videoLink: dto.videoLink }),
        ...(dto.categoryId && { categoryId: dto.categoryId }),
      },
      include: {
        category: true,
      },
    });
  }

  async deleteProduct(id: string) {
    const product = await this.db.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.db.product.delete({
      where: { id },
    });

    return { message: 'Product deleted successfully' };
  }
}
