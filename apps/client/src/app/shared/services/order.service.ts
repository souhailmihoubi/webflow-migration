import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PlaceOrderDto } from '@my-org/api-interfaces';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/orders`;

  placeOrder(dto: PlaceOrderDto): Observable<any> {
    return this.http.post<any>(this.apiUrl, dto);
  }

  getUserOrders(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getOrderById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  cancelOrder(id: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/cancel`, {});
  }
}
