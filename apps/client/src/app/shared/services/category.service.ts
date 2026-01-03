import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Product } from './product.service';

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
  private apiUrl = 'http://localhost:3000/api/catalog/categories';

  categories = signal<Category[]>([]);

  fetchCategories(): Observable<Category[]> {
    return this.http
      .get<Category[]>(this.apiUrl)
      .pipe(tap((categories) => this.categories.set(categories)));
  }

  getCategoryBySlug(slug: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/slug/${slug}`);
  }

  searchCategories(query: string): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}?search=${query}`);
  }
}
