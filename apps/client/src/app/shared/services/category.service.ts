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

  // Priority order for categories
  private readonly prioritySlugs = ['salon', 'cac', 'sam'];

  fetchCategories(): Observable<any> {
    return this.http.get<any>(this.apiUrl).pipe(
      tap((response) => {
        let categoriesData: Category[] = [];

        if (Array.isArray(response)) {
          categoriesData = response;
        } else if (response.data && Array.isArray(response.data)) {
          categoriesData = response.data;
        }

        // Sort categories with priority slugs first
        const sortedCategories = this.sortCategories(categoriesData);
        this.categories.set(sortedCategories);
      }),
    );
  }

  private sortCategories(categories: Category[]): Category[] {
    // Split into priority and non-priority categories
    const priorityCategories: Category[] = [];
    const otherCategories: Category[] = [];

    categories.forEach((category) => {
      if (this.prioritySlugs.includes(category.slug)) {
        priorityCategories.push(category);
      } else {
        otherCategories.push(category);
      }
    });

    // Sort priority categories by their index in prioritySlugs
    priorityCategories.sort((a, b) => {
      const indexA = this.prioritySlugs.indexOf(a.slug);
      const indexB = this.prioritySlugs.indexOf(b.slug);
      return indexA - indexB;
    });

    // Return priority categories first, then others
    return [...priorityCategories, ...otherCategories];
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
