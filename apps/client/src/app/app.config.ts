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
import { PacksListComponent } from './packs/packs-list.component';
import { PackDetailComponent } from './packs/pack-detail.component';
import { AdminLayoutComponent } from './admin/admin-layout/admin-layout.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { CategoryListComponent } from './admin/categories/category-list.component';
import { ProductListComponent } from './admin/products/product-list.component';
import { OrderListComponent } from './admin/orders/order-list.component';
import { UserListComponent } from './admin/users/user-list.component';
import { PackListComponent } from './admin/packs/pack-list.component';
import { PackFormComponent } from './admin/packs/pack-form.component';
import { authGuard, adminGuard } from './shared/auth/auth.guard';

const routes: Routes = [
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', component: DashboardComponent },
      { path: 'categories', component: CategoryListComponent },
      { path: 'products', component: ProductListComponent },
      { path: 'packs', component: PackListComponent },
      { path: 'packs/new', component: PackFormComponent },
      { path: 'packs/:id/edit', component: PackFormComponent },
      { path: 'orders', component: OrderListComponent },
      { path: 'users', component: UserListComponent },
    ],
  },
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent },
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
  { path: 'packs', component: PacksListComponent },
  { path: 'pack/:slug', component: PackDetailComponent },
  { path: '', component: HomeComponent, pathMatch: 'full' },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
  ],
};
