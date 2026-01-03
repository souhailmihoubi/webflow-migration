import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { OrderService } from './order.service';
import {
  AddToCartDto,
  UpdateCartItemDto,
  PlaceOrderDto,
} from '@my-org/api-interfaces';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // ========== Cart Management (Protected) ==========

  @UseGuards(JwtAuthGuard)
  @Get('cart')
  getCart(@CurrentUser() user: any) {
    return this.orderService.getCart(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('cart/items')
  addToCart(@CurrentUser() user: any, @Body() dto: AddToCartDto) {
    return this.orderService.addToCart(user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('cart/items/:itemId')
  updateCartItem(
    @CurrentUser() user: any,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.orderService.updateCartItem(user.userId, itemId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('cart/items/:itemId')
  removeFromCart(@CurrentUser() user: any, @Param('itemId') itemId: string) {
    return this.orderService.removeFromCart(user.userId, itemId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('cart')
  clearCart(@CurrentUser() user: any) {
    return this.orderService.clearCart(user.userId);
  }

  // ========== Order Management (Protected) ==========

  @UseGuards(JwtAuthGuard)
  @Post()
  placeOrder(@CurrentUser() user: any, @Body() dto: PlaceOrderDto) {
    return this.orderService.placeOrder(user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getUserOrders(@CurrentUser() user: any) {
    return this.orderService.getUserOrders(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getOrderById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.orderService.getOrderById(user.userId, id);
  }

  // ========== Admin Order Management ==========

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/all')
  getAllOrders() {
    return this.orderService.getAllOrders();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id/status')
  updateOrderStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.orderService.updateOrderStatus(id, body.status);
  }
}
