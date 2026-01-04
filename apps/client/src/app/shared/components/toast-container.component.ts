import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-4 right-4 z-[300] space-y-2">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="min-w-[300px] max-w-md px-6 py-4 rounded-lg shadow-lg backdrop-blur-sm animate-in slide-in-from-right duration-300"
          [class.bg-green-500]="toast.type === 'success'"
          [class.bg-red-500]="toast.type === 'error'"
          [class.bg-blue-500]="toast.type === 'info'"
        >
          <div class="flex items-center space-x-3">
            <!-- Icon -->
            @if (toast.type === 'success') {
              <svg
                class="w-6 h-6 text-white flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            } @else if (toast.type === 'error') {
              <svg
                class="w-6 h-6 text-white flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            } @else {
              <svg
                class="w-6 h-6 text-white flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }

            <!-- Message -->
            <p class="text-white font-medium text-sm">{{ toast.message }}</p>

            <!-- Close button -->
            <button
              (click)="toastService.remove(toast.id)"
              class="ml-auto text-white hover:text-gray-200 transition-colors"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
}
