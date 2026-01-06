import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { Product } from './product.service';
import { environment } from '../../../environments/environment';

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  showInHomePage: boolean;
  products?: Product[];
  _count?: {
    products: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/catalog/categories`;

  categories = signal<Category[]>([]);

  fetchCategories(): Observable<any> {
    return this.http.get<any>(this.apiUrl).pipe(
      tap((response) => {
        if (Array.isArray(response)) {
          this.categories.set(response);
        } else if (response.data && Array.isArray(response.data)) {
          this.categories.set(response.data);
        }
      }),
    );
  }

  getCategoryBySlug(
    slug: string,
    minPrice?: number,
    maxPrice?: number,
  ): Observable<Category> {
    let params = new HttpParams();
    if (minPrice) params = params.set('minPrice', minPrice.toString());
    if (maxPrice) params = params.set('maxPrice', maxPrice.toString());

    return this.http.get<Category>(`${this.apiUrl}/slug/${slug}`, {
      params,
    });
  }

  searchCategories(query: string): Observable<Category[]> {
    return this.http
      .get<Category[] | { data: Category[] }>(`${this.apiUrl}?search=${query}`)
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
}
