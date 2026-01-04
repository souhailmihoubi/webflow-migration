import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  // Dashboard Stats
  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/dashboard/stats`);
  }

  // Users
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/users`);
  }

  updateUserRole(userId: string, role: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/users/${userId}/role`, { role });
  }

  // Categories
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/catalog/categories`);
  }

  createCategory(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/catalog/categories`, data);
  }

  updateCategory(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/catalog/categories/${id}`, data);
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/catalog/categories/${id}`);
  }

  // Products
  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/catalog/products`);
  }

  createProduct(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/catalog/products`, data);
  }

  updateProduct(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/catalog/products/${id}`, data);
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/catalog/products/${id}`);
  }

  // Orders
  getAllOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/orders/admin/all`);
  }

  updateOrderStatus(id: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/orders/${id}/status`, { status });
  }

  // Packs
  getAllPacks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/catalog/packs`);
  }

  getPackById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/catalog/packs/${id}`);
  }

  createPack(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/packs`, data);
  }

  updatePack(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/packs/${id}`, data);
  }

  deletePack(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/packs/${id}`);
  }

  // Get products by category slug
  getProductsByCategory(categorySlug: string): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/catalog/categories/${categorySlug}`,
    );
  }
}
