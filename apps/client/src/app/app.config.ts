import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';

import { provideRouter, Routes } from '@angular/router';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';

import { authInterceptor } from './shared/auth/auth.interceptor';

import { HomeComponent } from './home/home.component';
import { CategoryDetailComponent } from './category/category-detail.component';
import { ProductDetailComponent } from './product/product-detail.component';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { OrderHistoryComponent } from './profile/order-history/order-history.component';
import { OrderDetailComponent } from './profile/order-detail/order-detail.component';
import { UserProfileComponent } from './profile/user-profile/user-profile.component';
import { ContactComponent } from './contact/contact.component';
import { authGuard } from './shared/auth/auth.guard';

const routes: Routes = [
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },
  { path: 'contact', component: ContactComponent },
  {
    path: 'profile',
    component: UserProfileComponent,
    canActivate: [authGuard],
  },
  {
    path: 'profile/orders',
    component: OrderHistoryComponent,
    canActivate: [authGuard],
  },
  {
    path: 'profile/orders/:id',
    component: OrderDetailComponent,
    canActivate: [authGuard],
  },

  { path: 'category/:slug', component: CategoryDetailComponent },

  { path: 'product/:slug', component: ProductDetailComponent },
  { path: '', component: HomeComponent, pathMatch: 'full' },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
  ],
};
