import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CategoryDetailComponent } from './category/category-detail.component';
import { ProductDetailComponent } from './product/product-detail.component';
import { CartComponent } from './cart/cart.component';
import { PacksListComponent } from './packs/packs-list.component';
import { PackDetailComponent } from './packs/pack-detail.component';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'cart', component: CartComponent },
  { path: 'packs', component: PacksListComponent },
  { path: 'pack/:slug', component: PackDetailComponent },
  { path: 'category/:slug', component: CategoryDetailComponent },
  { path: 'product/:slug', component: ProductDetailComponent },
];

// Re-compiled to ensure CartComponent is recognized.
