import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { CartService, CartItem } from '../shared/services/cart.service';
import { OrderService } from '../shared/services/order.service';
import { PlaceOrderDto } from '@my-org/api-interfaces';
import { AuthService } from '../shared/auth/auth.service';
import {
  TUNISIA_GOVERNORATES,
  getShippingCost,
} from '../shared/constants/governorates';

import { COUNTRY_CODES } from '../shared/constants/countries';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent {
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  cartItems = this.cartService.cartItems;
  cartCount = this.cartService.cartCount;
  cartTotal = this.cartService.cartTotal;

  governorates = TUNISIA_GOVERNORATES;
  countryCodes = COUNTRY_CODES;
  shippingCost = signal(7); // Default shipping cost

  orderTotal = computed(() => {
    return this.cartTotal() + this.shippingCost();
  });

  checkoutForm = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    countryCode: ['+216', [Validators.required]],
    phone: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    address: ['', [Validators.required]],
    city: ['', [Validators.required]],
    notes: [''],
  });

  isSubmitted = signal(false);
  isReviewModalOpen = signal(false);
  isLoading = signal(false);

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.checkoutForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: '', // Placeholder
        });
      }
    });
  }

  onSubmit() {
    if (this.checkoutForm.valid) {
      this.isReviewModalOpen.set(true);
    } else {
      this.checkoutForm.markAllAsTouched();
    }
  }

  onCityChange(event: Event) {
    const city = (event.target as HTMLSelectElement).value;
    const cost = getShippingCost(city);
    this.shippingCost.set(cost);
  }

  closeReviewModal() {
    this.isReviewModalOpen.set(false);
  }

  confirmOrder() {
    this.isLoading.set(true);

    const countryCode = this.checkoutForm.get('countryCode')?.value || '';
    const phoneNumber = this.checkoutForm.get('phone')?.value || '';
    const fullPhone = `${countryCode} ${phoneNumber}`;

    const orderDto: PlaceOrderDto = {
      firstName: this.checkoutForm.get('firstName')?.value || '',
      lastName: this.checkoutForm.get('lastName')?.value || '',
      email: this.checkoutForm.get('email')?.value || '',
      phone: fullPhone,
      shippingAddress: this.checkoutForm.get('address')?.value || '',
      city: this.checkoutForm.get('city')?.value || '',
      shippingCost: this.shippingCost(),
      remarks: this.checkoutForm.get('notes')?.value || '',
      items: this.cartItems().map((item: any) => ({
        productId:
          item.type === 'product' && item.product ? item.product.id : undefined,
        packId: item.type === 'pack' && item.pack ? item.pack.id : undefined,
        quantity: item.quantity,
      })),
    };

    this.orderService.placeOrder(orderDto).subscribe({
      next: (res: any) => {
        this.isLoading.set(false);
        this.isReviewModalOpen.set(false);
        this.isSubmitted.set(true);
        this.cartService.clearCart();
        // Scroll to top to see success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err: any) => {
        this.isLoading.set(false);
        console.error('Error placing order:', err);
        alert(
          'Une erreur est survenue lors de la validation de votre commande. Veuillez réessayer.',
        );
      },
    });
  }

  getItemPrice(item: any): number {
    if (item.type === 'product' && item.product) {
      const product = item.product;
      const price = product.discountPrice ?? product.price;
      return typeof price === 'string' ? parseFloat(price) : price;
    } else if (item.type === 'pack' && item.pack) {
      const price = item.pack.price;
      return typeof price === 'string' ? parseFloat(price) : price;
    }
    return 0;
  }
}
