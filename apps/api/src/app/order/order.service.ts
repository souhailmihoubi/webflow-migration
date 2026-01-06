import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  AddToCartDto,
  UpdateCartItemDto,
  PlaceOrderDto,
} from '@my-org/api-interfaces';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class OrderService {
  constructor(private readonly db: DatabaseService) {}

  // ========== Cart Management ==========

  async getCart(userId: string) {
    // Find or create cart for user
    let cart = await this.db.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await this.db.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });
    }

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => {
      const price = item.product.discountPrice;
      return sum + Number(price) * item.quantity;
    }, 0);

    return {
      ...cart,
      subtotal,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }

  async addToCart(userId: string, dto: AddToCartDto) {
    // Validate product exists
    const product = await this.db.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (dto.quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    // Get or create cart
    let cart = await this.db.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await this.db.cart.create({
        data: { userId },
      });
    }

    // Check if product already in cart
    const existingItem = await this.db.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: dto.productId,
      },
    });

    if (existingItem) {
      // Update quantity
      await this.db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + dto.quantity },
      });
    } else {
      // Add new item
      await this.db.cartItem.create({
        data: {
          cartId: cart.id,
          productId: dto.productId,
          quantity: dto.quantity,
        },
      });
    }

    // Update cart timestamp
    await this.db.cart.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() },
    });

    return this.getCart(userId);
  }

  async updateCartItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const cart = await this.db.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const item = await this.db.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id,
      },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    if (dto.quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    await this.db.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
    });

    await this.db.cart.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() },
    });

    return this.getCart(userId);
  }

  async removeFromCart(userId: string, itemId: string) {
    const cart = await this.db.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const item = await this.db.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id,
      },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.db.cartItem.delete({
      where: { id: itemId },
    });

    await this.db.cart.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() },
    });

    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.db.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    await this.db.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    await this.db.cart.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() },
    });

    return { message: 'Cart cleared successfully' };
  }

  // ========== Order Management ==========

  async placeOrder(userId: string | undefined, dto: PlaceOrderDto) {
    let orderItems: any[] = [];
    let totalPrice = new Decimal(0);

    if (dto.items && dto.items.length > 0) {
      // Use items from DTO
      for (const item of dto.items) {
        if (item.productId) {
          const product = await this.db.product.findUnique({
            where: { id: item.productId },
          });
          if (!product) continue;
          const price = product.discountPrice;
          totalPrice = totalPrice.add(new Decimal(price).mul(item.quantity));
          orderItems.push({
            productId: item.productId,
            quantity: item.quantity,
            priceAtTime: price,
          });
        } else if (item.packId) {
          const pack = await this.db.pack.findUnique({
            where: { id: item.packId },
          });
          if (!pack) continue;
          totalPrice = totalPrice.add(
            new Decimal(pack.price).mul(item.quantity),
          );
          orderItems.push({
            packId: item.packId,
            quantity: item.quantity,
            priceAtTime: pack.price,
          });
        }
      }
    } else if (userId) {
      // Fallback: Get cart from DB
      const cart = await this.db.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
              pack: true,
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      orderItems = cart.items.map((item) => {
        let price: Decimal;
        if (item.productId && item.product) {
          price = item.product.discountPrice || item.product.price;
        } else if (item.packId && item.pack) {
          price = item.pack.price;
        } else {
          price = new Decimal(0); // Should not happen if data integrity is maintained
        }

        totalPrice = totalPrice.add(new Decimal(price).mul(item.quantity));
        return {
          productId: item.productId,
          packId: item.packId,
          quantity: item.quantity,
          priceAtTime: price,
        };
      });

      // Clear DB cart if we used it
      await this.db.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    if (orderItems.length === 0) {
      throw new BadRequestException('No items provided for order');
    }

    // Create order
    const order = await this.db.order.create({
      data: {
        userId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        secondaryPhone: dto.secondaryPhone,
        email: dto.email,
        shippingAddress: dto.shippingAddress,
        city: dto.city,
        shippingCost: dto.shippingCost,
        remarks: dto.remarks,
        paymentMethod: dto.paymentMethod as any, // Cast to any to avoid type mismatch before prisma generate
        paymentPlan: dto.paymentPlan as any,
        totalPrice,
        status: 'PENDING',
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    return order;
  }

  async getUserOrders(userId: string) {
    return this.db.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderById(userId: string, orderId: string) {
    const order = await this.db.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async cancelOrder(userId: string, orderId: string) {
    const order = await this.db.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Only pending orders can be cancelled');
    }

    return this.db.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  // ========== Admin Order Management ==========

  async getAllOrders(
    page = 1,
    limit = 10,
    search?: string,
    status?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.db.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.db.order.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async updateOrderStatus(orderId: string, status: string) {
    const validStatuses = [
      'PENDING',
      'CONFIRMED',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
    ];

    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid order status');
    }

    const order = await this.db.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.db.order.update({
      where: { id: orderId },
      data: { status: status as any },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }
}
