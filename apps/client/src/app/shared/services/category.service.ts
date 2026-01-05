import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
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

  getCategoryBySlug(slug: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/slug/${slug}`);
  }

  searchCategories(query: string): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}?search=${query}`);
  }
}
