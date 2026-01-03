import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface Product {
  id: string;
  name: string;
  slug: string;
  mainImage: string;
  multiImages: string[];
  price: string | number;
  discountPrice?: string | number | null;
  productDescription: string;
  showInMenu: boolean;
  category: {
    name: string;
    slug: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/catalog/products';

  products = signal<Product[]>([]);

  fetchProducts(categoryId?: string): Observable<Product[]> {
    let url = this.apiUrl;
    if (categoryId) {
      url += `?categoryId=${categoryId}`;
    }
    return this.http
      .get<Product[]>(url)
      .pipe(tap((products) => this.products.set(products)));
  }
}
