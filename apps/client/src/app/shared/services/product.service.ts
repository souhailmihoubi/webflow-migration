import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Product {
  id: string;
  name: string;
  slug: string;
  mainImage: string;
  multiImages: string[];
  price: string | number;
  discountPrice: string | number;
  productDescription: string;
  priceDetails: string;
  showInMenu: boolean;
  videoLink?: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  visible: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/catalog/products`;

  products = signal<Product[]>([]);

  fetchProducts(categoryId?: string): Observable<Product[]> {
    let url = this.apiUrl;
    if (categoryId) {
      url += `?categoryId=${categoryId}`;
    }
    return this.http.get<Product[] | { data: Product[] }>(url).pipe(
      map((response) => {
        if (Array.isArray(response)) {
          return response;
        } else if (
          response &&
          'data' in response &&
          Array.isArray(response.data)
        ) {
          return response.data;
        }
        return [];
      }),
      tap((products) => this.products.set(products)),
    );
  }

  searchProducts(query: string): Observable<Product[]> {
    return this.http
      .get<
        Product[] | { data: Product[] }
      >(`${this.apiUrl}?search=${query}&visible=true`)
      .pipe(
        map((response) => {
          if (Array.isArray(response)) {
            return response;
          } else if (
            response &&
            'data' in response &&
            Array.isArray(response.data)
          ) {
            return response.data;
          }
          return [];
        }),
      );
  }

  getProductBySlug(slug: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/slug/${slug}`);
  }
}
