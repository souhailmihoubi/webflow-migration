import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService, CartItem } from '../shared/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
})
export class CartComponent {
  private cartService = inject(CartService);

  cartItems = this.cartService.cartItems;
  cartCount = this.cartService.cartCount;
  cartTotal = this.cartService.cartTotal;

  getItemTotal(item: CartItem): number {
    const price =
      typeof item.product.discountPrice === 'number'
        ? item.product.discountPrice
        : parseFloat(String(item.product.discountPrice || item.product.price));
    return price * item.quantity;
  }

  updateQuantity(productId: string, quantity: number) {
    this.cartService.updateQuantity(productId, quantity);
  }

  removeItem(productId: string) {
    this.cartService.removeFromCart(productId);
  }

  clearCart() {
    this.cartService.clearCart();
  }
}
