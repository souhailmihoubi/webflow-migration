import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  showInHomePage: boolean;
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

  searchCategories(query: string): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}?search=${query}`);
  }
}
