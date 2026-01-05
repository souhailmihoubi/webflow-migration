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
  discountPrice?: string | number | null;
  productDescription: string;
  showInMenu: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  };
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
    return this.http.get<any>(url).pipe(
      map((response: any) => {
        if (Array.isArray(response)) {
          return response;
        } else if (response.data && Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      }),
      tap((products) => this.products.set(products)),
    );
  }

  searchProducts(query: string): Observable<Product[]> {
    return this.http.get<Product[]>(
      `${this.apiUrl}?search=${query}&visible=true`,
    );
  }

  getProductBySlug(slug: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/slug/${slug}`);
  }
}
