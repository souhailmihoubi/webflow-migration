import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService, CartItem } from '../shared/services/cart.service';
import { AuthService } from '../shared/auth/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
})
export class CartComponent {
  private cartService = inject(CartService);
  private authService = inject(AuthService);

  cartItems = this.cartService.cartItems;
  cartCount = this.cartService.cartCount;
  cartTotal = this.cartService.cartTotal;
  currentUser = this.authService.currentUser;

  openAuthModal() {
    this.authService.openAuthModal();
  }

  getItemTotal(item: CartItem): number {
    if (item.type === 'product' && item.product) {
      const price =
        typeof item.product.discountPrice === 'number'
          ? item.product.discountPrice
          : parseFloat(
              String(item.product.discountPrice || item.product.price),
            );
      return price * item.quantity;
    } else if (item.type === 'pack' && item.pack) {
      const price =
        typeof item.pack.price === 'number'
          ? item.pack.price
          : parseFloat(String(item.pack.price));
      return price * item.quantity;
    }
    return 0;
  }

  updateQuantity(itemId: string, quantity: number, type: 'product' | 'pack') {
    this.cartService.updateQuantity(itemId, quantity, type);
  }

  removeItem(itemId: string, type: 'product' | 'pack') {
    this.cartService.removeFromCart(itemId, type);
  }

  clearCart() {
    this.cartService.clearCart();
  }
}
