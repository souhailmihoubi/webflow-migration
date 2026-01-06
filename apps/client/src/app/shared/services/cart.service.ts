import { Injectable, signal, computed } from '@angular/core';
import { Product } from './product.service';
import { Pack } from './pack.service';

export interface CartItem {
  product?: Product;
  pack?: Pack;
  quantity: number;
  type: 'product' | 'pack';
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
      let price = 0;
      if (item.type === 'product' && item.product) {
        price =
          typeof item.product.discountPrice === 'number'
            ? item.product.discountPrice
            : parseFloat(String(item.product.discountPrice));
      } else if (item.type === 'pack' && item.pack) {
        price =
          typeof item.pack.price === 'number'
            ? item.pack.price
            : parseFloat(String(item.pack.price));
      }
      return acc + price * item.quantity;
    }, 0),
  );

  addToCart(product: Product, quantity = 1) {
    this.cartItemsSignal.update((items) => {
      const existingItem = items.find(
        (i) => i.type === 'product' && i.product?.id === product.id,
      );
      if (existingItem) {
        return items.map((i) =>
          i.type === 'product' && i.product?.id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i,
        );
      }
      return [...items, { product, quantity, type: 'product' as const }];
    });
    this.saveCart();
  }

  addPackToCart(pack: Pack, quantity = 1) {
    this.cartItemsSignal.update((items) => {
      const existingItem = items.find(
        (i) => i.type === 'pack' && i.pack?.id === pack.id,
      );
      if (existingItem) {
        return items.map((i) =>
          i.type === 'pack' && i.pack?.id === pack.id
            ? { ...i, quantity: i.quantity + quantity }
            : i,
        );
      }
      return [...items, { pack, quantity, type: 'pack' as const }];
    });
    this.saveCart();
  }

  removeFromCart(itemId: string, type: 'product' | 'pack' = 'product') {
    this.cartItemsSignal.update((items) =>
      items.filter((i) => {
        if (type === 'product') {
          return !(i.type === 'product' && i.product?.id === itemId);
        } else {
          return !(i.type === 'pack' && i.pack?.id === itemId);
        }
      }),
    );
    this.saveCart();
  }

  updateQuantity(
    itemId: string,
    quantity: number,
    type: 'product' | 'pack' = 'product',
  ) {
    if (quantity <= 0) {
      this.removeFromCart(itemId, type);
      return;
    }
    this.cartItemsSignal.update((items) =>
      items.map((i) => {
        if (
          type === 'product' &&
          i.type === 'product' &&
          i.product?.id === itemId
        ) {
          return { ...i, quantity };
        } else if (
          type === 'pack' &&
          i.type === 'pack' &&
          i.pack?.id === itemId
        ) {
          return { ...i, quantity };
        }
        return i;
      }),
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
    if (!saved) return [];

    try {
      const items = JSON.parse(saved);
      // Migrate legacy cart items that don't have the 'type' field
      return items.map((item: any) => {
        if (!item.type) {
          // Legacy item - determine type based on which property exists
          if (item.product) {
            return { ...item, type: 'product' as const };
          } else if (item.pack) {
            return { ...item, type: 'pack' as const };
          }
        }
        return item;
      });
    } catch (error) {
      console.error('Error loading cart:', error);
      return [];
    }
  }
}
