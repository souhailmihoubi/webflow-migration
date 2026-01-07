import { Injectable, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
}

interface AuthResponse {
  accessToken: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  // Signal to track the current logged-in user
  currentUser = signal<User | null>(this.getUserFromStorage());

  // Global state for Auth Modal
  isAuthModalOpen = signal(false);

  openAuthModal() {
    this.isAuthModalOpen.set(true);
  }

  closeAuthModal() {
    this.isAuthModalOpen.set(false);
  }

  constructor() {
    /* empty */
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  login(credentials: { email: string; password: string }) {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(tap((response) => this.handleAuthSuccess(response)));
  }

  register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
  }) {
    const payload = { ...data, role: 'CUSTOMER' }; // Default role
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, payload)
      .pipe(tap((response) => this.handleAuthSuccess(response)));
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    this.currentUser.set(null);
  }

  private handleAuthSuccess(response: AuthResponse) {
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('user', JSON.stringify(response.user));
    this.currentUser.set(response.user);
  }

  getToken() {
    return localStorage.getItem('accessToken');
  }

  getProfile() {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }

  updateProfile(data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) {
    return this.http.put<User>(`${this.apiUrl}/profile`, data).pipe(
      tap((user) => {
        const currentUser = this.currentUser();
        if (currentUser) {
          const updatedUser = { ...currentUser, ...user };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          this.currentUser.set(updatedUser);
        }
      }),
    );
  }

  changePassword(data: any) {
    return this.http.post(`${this.apiUrl}/change-password`, data);
  }

  forgotPassword(email: string) {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/forgot-password`,
      { email },
    );
  }

  resetPassword(data: { token: string; newPassword: string }) {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/reset-password`,
      data,
    );
  }
}
