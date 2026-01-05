import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Pack {
  id: string;
  name: string;
  slug: string;
  description?: string;
  mainImage?: string;
  price: string | number;
  discountPercentage?: number;
  showInMenu: boolean;
  productSam: {
    id: string;
    name: string;
    slug: string;
    mainImage: string;
    price: string | number;
    discountPrice?: string | number | null;
    category: {
      id: string;
      name: string;
      slug: string;
    };
  };
  productCac: {
    id: string;
    name: string;
    slug: string;
    mainImage: string;
    price: string | number;
    discountPrice?: string | number | null;
    category: {
      id: string;
      name: string;
      slug: string;
    };
  };
  productSalon: {
    id: string;
    name: string;
    slug: string;
    mainImage: string;
    price: string | number;
    discountPrice?: string | number | null;
    category: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

@Injectable({
  providedIn: 'root',
})
export class PackService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/catalog/packs`;

  packs = signal<Pack[]>([]);

  fetchPacks(): Observable<Pack[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((response) => {
        if (Array.isArray(response)) {
          return response;
        } else if (response.data && Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      }),
      tap((packs) => this.packs.set(packs)),
    );
  }

  getPackBySlug(slug: string): Observable<Pack> {
    return this.http.get<Pack>(`${this.apiUrl}/${slug}`);
  }
}
