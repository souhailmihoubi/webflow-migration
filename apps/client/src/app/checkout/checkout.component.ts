import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { CartService } from '../shared/services/cart.service';
import { OrderService } from '../shared/services/order.service';
import {
  PlaceOrderDto,
  PaymentMethod,
  PaymentPlan,
} from '@my-org/api-interfaces';
import { AuthService } from '../shared/auth/auth.service';
import { ToastService } from '../shared/services/toast.service';
import {
  TUNISIA_GOVERNORATES,
  getShippingCost,
} from '../shared/constants/governorates';
import { COUNTRY_CODES } from '../shared/constants/countries';

import { tunisianPhoneValidator } from '../shared/validators/phone.validator';

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
  private toast = inject(ToastService);

  cartItems = this.cartService.cartItems;
  cartCount = this.cartService.cartCount;
  cartTotal = this.cartService.cartTotal;

  governorates = TUNISIA_GOVERNORATES;
  countryCodes = COUNTRY_CODES;
  shippingCost = signal(0); // Default shipping cost

  // Expose enums to template
  PaymentMethod = PaymentMethod;
  PaymentPlan = PaymentPlan;

  currentUser = this.authService.currentUser;

  orderTotal = computed(() => {
    return this.cartTotal() + this.shippingCost();
  });

  checkoutForm = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.email]],
    countryCode: ['+216', [Validators.required]],
    phone: [
      '',
      [
        Validators.required,
        Validators.pattern(/^\d+$/),
        tunisianPhoneValidator,
      ],
    ],
    secondaryPhone: ['', [Validators.pattern(/^\d+$/), tunisianPhoneValidator]],
    address: ['', [Validators.required]],
    city: ['', [Validators.required]],
    notes: [''],
    paymentMethod: [PaymentMethod.COD, [Validators.required]],
    paymentPlan: [PaymentPlan.FULL],
  });

  isSubmitted = signal(false);
  isReviewModalOpen = signal(false);
  isLoading = signal(false);
  placedOrder = signal<any>(null); // Store the placed order for the success view

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

    // Reset payment plan if payment method changes to COD
    this.checkoutForm.get('paymentMethod')?.valueChanges.subscribe((method) => {
      if (method === PaymentMethod.COD) {
        this.checkoutForm.patchValue({ paymentPlan: PaymentPlan.FULL });
      }
    });

    // Re-validate phone numbers when country code changes
    this.checkoutForm.get('countryCode')?.valueChanges.subscribe(() => {
      this.checkoutForm.get('phone')?.updateValueAndValidity();
      this.checkoutForm.get('secondaryPhone')?.updateValueAndValidity();
    });
  }

  onSubmit() {
    if (this.checkoutForm.valid) {
      this.isReviewModalOpen.set(true);
    } else {
      this.checkoutForm.markAllAsTouched();
      this.showValidationErrors();
    }
  }

  private showValidationErrors() {
    const controls = this.checkoutForm.controls;

    if (controls.firstName.invalid) {
      this.toast.error('Le prénom est requis');
      return;
    }
    if (controls.lastName.invalid) {
      this.toast.error('Le nom est requis');
      return;
    }
    if (controls.phone.invalid) {
      if (controls.phone.errors?.['required']) {
        this.toast.error('Le numéro de téléphone est requis');
      } else if (controls.phone.errors?.['tunisianPhone']) {
        this.toast.error(controls.phone.errors['tunisianPhone'].message);
      } else if (controls.phone.errors?.['pattern']) {
        this.toast.error(
          'Le numéro de téléphone doit contenir uniquement des chiffres',
        );
      }
      return;
    }
    if (controls.city.invalid) {
      this.toast.error('Veuillez sélectionner votre gouvernorat');
      return;
    }
    if (controls.address.invalid) {
      this.toast.error("L'adresse de livraison est requise");
      return;
    }
    if (controls.email.invalid) {
      this.toast.error("L'adresse email est invalide");
      return;
    }

    this.toast.error('Veuillez remplir tous les champs obligatoires');
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

    // Optional secondary phone
    const secondaryPhoneNumber =
      this.checkoutForm.get('secondaryPhone')?.value || '';
    const fullSecondaryPhone = secondaryPhoneNumber
      ? `${countryCode} ${secondaryPhoneNumber}`
      : undefined;

    const orderDto: PlaceOrderDto = {
      firstName: this.checkoutForm.get('firstName')?.value || '',
      lastName: this.checkoutForm.get('lastName')?.value || '',
      email: this.checkoutForm.get('email')?.value || undefined,
      phone: fullPhone,
      secondaryPhone: fullSecondaryPhone,
      shippingAddress: this.checkoutForm.get('address')?.value || '',
      city: this.checkoutForm.get('city')?.value || '',
      shippingCost: this.shippingCost(),
      remarks: this.checkoutForm.get('notes')?.value || '',
      paymentMethod:
        (this.checkoutForm.get('paymentMethod')?.value as PaymentMethod) ||
        PaymentMethod.COD,
      paymentPlan:
        (this.checkoutForm.get('paymentPlan')?.value as PaymentPlan) ||
        PaymentPlan.FULL,
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
        this.placedOrder.set(res); // Store order details
        this.isSubmitted.set(true);
        this.cartService.clearCart();
        this.toast.success('Votre commande a été validée avec succès !');
        // Scroll to top to see success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err: any) => {
        this.isLoading.set(false);
        console.error('Error placing order:', err);
        this.toast.error(
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
