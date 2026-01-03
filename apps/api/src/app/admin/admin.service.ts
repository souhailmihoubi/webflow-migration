import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly db: DatabaseService) {}

  async getDashboardStats() {
    // Get counts
    const [totalProducts, totalCategories, totalUsers, totalOrders] =
      await Promise.all([
        this.db.product.count(),
        this.db.category.count(),
        this.db.user.count(),
        this.db.order.count(),
      ]);

    // Get revenue (sum of all CONFIRMED, SHIPPED, and DELIVERED orders)
    const revenueResult = await this.db.order.aggregate({
      where: {
        status: {
          in: [
            OrderStatus.CONFIRMED,
            OrderStatus.SHIPPED,
            OrderStatus.DELIVERED,
          ],
        },
      },
      _sum: {
        totalPrice: true,
      },
    });

    const totalRevenue = revenueResult._sum.totalPrice?.toString() || '0';

    // Get pending orders count
    const pendingOrders = await this.db.order.count({
      where: { status: OrderStatus.PENDING },
    });

    // Get recent orders (last 5)
    const recentOrders = await this.db.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
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
              select: {
                id: true,
                name: true,
                mainImage: true,
              },
            },
          },
        },
      },
    });

    // Get low stock products (assuming stock management)
    // For now, just get recent products
    const recentProducts = await this.db.product.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        price: true,
        mainImage: true,
        showInMenu: true,
      },
    });

    return {
      stats: {
        totalProducts,
        totalCategories,
        totalUsers,
        totalOrders,
        totalRevenue,
        pendingOrders,
      },
      recentOrders,
      recentProducts,
    };
  }

  async getAllUsers() {
    return this.db.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserById(id: string) {
    const user = await this.db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          include: {
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                    mainImage: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async updateUserRole(userId: string, role: 'ADMIN' | 'CUSTOMER') {
    return this.db.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });
  }
}
