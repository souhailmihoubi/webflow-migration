import { Injectable, signal, computed } from '@angular/core';
import { Product } from './product.service';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartItemsSignal = signal<CartItem[]>(this.loadCart());

  cartItems = computed(() => this.cartItemsSignal());

  cartCount = computed(() =>
    this.cartItemsSignal().reduce((acc, item) => acc + item.quantity, 0),
  );

  cartTotal = computed(() =>
    this.cartItemsSignal().reduce((acc, item) => {
      const price =
        typeof item.product.discountPrice === 'number'
          ? item.product.discountPrice
          : parseFloat(
              String(item.product.discountPrice || item.product.price),
            );
      return acc + price * item.quantity;
    }, 0),
  );

  addToCart(product: Product, quantity = 1) {
    this.cartItemsSignal.update((items) => {
      const existingItem = items.find((i) => i.product.id === product.id);
      if (existingItem) {
        return items.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i,
        );
      }
      return [...items, { product, quantity }];
    });
    this.saveCart();
  }

  removeFromCart(productId: string) {
    this.cartItemsSignal.update((items) =>
      items.filter((i) => i.product.id !== productId),
    );
    this.saveCart();
  }

  updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    this.cartItemsSignal.update((items) =>
      items.map((i) => (i.product.id === productId ? { ...i, quantity } : i)),
    );
    this.saveCart();
  }

  clearCart() {
    this.cartItemsSignal.set([]);
    this.saveCart();
  }

  private saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cartItemsSignal()));
  }

  private loadCart(): CartItem[] {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  }
}
