import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreatePackDto, UpdatePackDto } from '@my-org/api-interfaces';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PackService {
  constructor(private db: DatabaseService) {}

  /**
   * Calculate pack price based on discount percentage
   */
  private async calculatePackPrice(
    productSamId: string,
    productCacId: string,
    productSalonId: string,
    discountPercentage = 5,
  ): Promise<Decimal> {
    const products = await this.db.product.findMany({
      where: {
        id: { in: [productSamId, productCacId, productSalonId] },
      },
      select: { id: true, discountPrice: true, price: true },
    });

    if (products.length !== 3) {
      throw new BadRequestException('All 3 products must exist');
    }

    const sum = products.reduce((total, product) => {
      const priceToUse = product.discountPrice || product.price;
      return total + Number(priceToUse);
    }, 0);

    // Apply discount percentage
    const discountMultiplier = (100 - discountPercentage) / 100;
    return new Decimal(sum * discountMultiplier);
  }

  /**
   * Validate that products belong to correct categories
   */
  private async validateProductCategories(
    productSamId: string,
    productCacId: string,
    productSalonId: string,
  ): Promise<void> {
    const products = await this.db.product.findMany({
      where: {
        id: { in: [productSamId, productCacId, productSalonId] },
      },
      include: { category: true },
    });

    const samProduct = products.find((p) => p.id === productSamId);
    const cacProduct = products.find((p) => p.id === productCacId);
    const salonProduct = products.find((p) => p.id === productSalonId);

    if (!samProduct || samProduct.category.slug !== 'sam') {
      throw new BadRequestException('Product SAM must be from category "sam"');
    }

    if (!cacProduct || cacProduct.category.slug !== 'cac') {
      throw new BadRequestException('Product CAC must be from category "cac"');
    }

    if (!salonProduct || salonProduct.category.slug !== 'salon') {
      throw new BadRequestException(
        'Product Salon must be from category "salon"',
      );
    }
  }

  async createPack(dto: CreatePackDto) {
    // Validate categories
    await this.validateProductCategories(
      dto.productSamId,
      dto.productCacId,
      dto.productSalonId,
    );

    const discountPercentage = dto.discountPercentage ?? 5;

    // Calculate price with discount
    const price = await this.calculatePackPrice(
      dto.productSamId,
      dto.productCacId,
      dto.productSalonId,
      discountPercentage,
    );

    return this.db.pack.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        mainImage: dto.mainImage,
        price,
        discountPercentage,
        showInMenu: dto.showInMenu ?? true,
        productSamId: dto.productSamId,
        productCacId: dto.productCacId,
        productSalonId: dto.productSalonId,
      },
      include: {
        productSam: true,
        productCac: true,
        productSalon: true,
      },
    });
  }

  async getAdminPacks(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.db.pack.findMany({
        where,
        skip,
        take: limit,
        include: {
          productSam: { include: { category: true } },
          productCac: { include: { category: true } },
          productSalon: { include: { category: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.db.pack.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async getAllPacks(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.db.pack.findMany({
        where: { showInMenu: true },
        skip,
        take: limit,
        include: {
          productSam: { include: { category: true } },
          productCac: { include: { category: true } },
          productSalon: { include: { category: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.db.pack.count({ where: { showInMenu: true } }),
    ]);

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async getPackBySlug(slug: string) {
    const pack = await this.db.pack.findUnique({
      where: { slug },
      include: {
        productSam: { include: { category: true } },
        productCac: { include: { category: true } },
        productSalon: { include: { category: true } },
      },
    });

    if (!pack) {
      throw new NotFoundException(`Pack with slug "${slug}" not found`);
    }

    return pack;
  }

  async getPackById(id: string) {
    const pack = await this.db.pack.findUnique({
      where: { id },
      include: {
        productSam: { include: { category: true } },
        productCac: { include: { category: true } },
        productSalon: { include: { category: true } },
      },
    });

    if (!pack) {
      throw new NotFoundException(`Pack with id "${id}" not found`);
    }

    return pack;
  }

  async updatePack(id: string, dto: UpdatePackDto) {
    const existingPack = await this.getPackById(id);

    // If products are being updated, validate and recalculate price
    const productSamId = dto.productSamId || existingPack.productSamId;
    const productCacId = dto.productCacId || existingPack.productCacId;
    const productSalonId = dto.productSalonId || existingPack.productSalonId;
    const discountPercentage =
      dto.discountPercentage ?? existingPack.discountPercentage ?? 5;

    if (dto.productSamId || dto.productCacId || dto.productSalonId) {
      await this.validateProductCategories(
        productSamId,
        productCacId,
        productSalonId,
      );
    }

    const price = await this.calculatePackPrice(
      productSamId,
      productCacId,
      productSalonId,
      discountPercentage,
    );

    return this.db.pack.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        mainImage: dto.mainImage,
        showInMenu: dto.showInMenu,
        productSamId: dto.productSamId,
        productCacId: dto.productCacId,
        productSalonId: dto.productSalonId,
        discountPercentage,
        price,
      },
      include: {
        productSam: true,
        productCac: true,
        productSalon: true,
      },
    });
  }

  async deletePack(id: string) {
    await this.getPackById(id); // Verify exists
    return this.db.pack.delete({ where: { id } });
  }
}
