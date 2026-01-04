import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { CartService } from '../shared/services/cart.service';
import { OrderService } from '../shared/services/order.service';
import { PlaceOrderDto } from '@my-org/api-interfaces';
import { AuthService } from '../shared/auth/auth.service';

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

  checkoutForm = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    address: ['', [Validators.required]],
    city: ['', [Validators.required]],
    notes: [''],
    paymentFacility: [false],
    acceptTerms: [false, [Validators.requiredTrue]],
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
          phone: '', // Placeholder: assuming phone is not in token by default or needs separate fetch
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

  closeReviewModal() {
    this.isReviewModalOpen.set(false);
  }

  confirmOrder() {
    this.isLoading.set(true);

    const orderDto: PlaceOrderDto = {
      firstName: this.checkoutForm.get('firstName')?.value || '',
      lastName: this.checkoutForm.get('lastName')?.value || '',
      email: this.checkoutForm.get('email')?.value || '',
      phone: this.checkoutForm.get('phone')?.value || '',
      shippingAddress: this.checkoutForm.get('address')?.value || '',
      city: this.checkoutForm.get('city')?.value || '',
      remarks: this.checkoutForm.get('notes')?.value || '',
      items: this.cartItems().map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    };

    this.orderService.placeOrder(orderDto).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.isReviewModalOpen.set(false);
        this.isSubmitted.set(true);
        this.cartService.clearCart();
        // Scroll to top to see success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Error placing order:', err);
        alert(
          'Une erreur est survenue lors de la validation de votre commande. Veuillez réessayer.',
        );
      },
    });
  }

  getItemPrice(item: any): number {
    const product = item.product;
    const price = product.discountPrice ?? product.price;
    return typeof price === 'string' ? parseFloat(price) : price;
  }
}
