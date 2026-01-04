import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastIdCounter = 0;
  toasts = signal<Toast[]>([]);

  show(
    message: string,
    type: 'success' | 'error' | 'info' = 'info',
    duration = 2000,
  ) {
    const id = this.toastIdCounter++;
    const toast: Toast = { id, message, type };

    // Add toast
    this.toasts.update((toasts) => [...toasts, toast]);

    // Auto remove after duration
    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  success(message: string, duration = 2000) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = 3000) {
    this.show(message, 'error', duration);
  }

  remove(id: number) {
    this.toasts.update((toasts) => toasts.filter((t) => t.id !== id));
  }
}
