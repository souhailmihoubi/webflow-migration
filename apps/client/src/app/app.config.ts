import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { HomeComponent } from './home/home.component';
import { CategoryDetailComponent } from './category/category-detail.component';
import { ProductDetailComponent } from './product/product-detail.component';
import { CartComponent } from './cart/cart.component';

const routes: Routes = [
  { path: 'cart', component: CartComponent },
  { path: 'category/:slug', component: CategoryDetailComponent },
  { path: 'product/:slug', component: ProductDetailComponent },
  { path: '', component: HomeComponent, pathMatch: 'full' },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch()),
  ],
};
