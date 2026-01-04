import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (show()) {
      <div class="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          (click)="onCancel()"
        ></div>

        <div
          class="relative bg-white w-full max-w-md shadow-2xl border border-gray-50 overflow-hidden animate-in fade-in zoom-in duration-200"
        >
          <!-- Header -->
          <div class="bg-red-50 border-b border-red-100 p-6">
            <div class="flex items-center space-x-3">
              <div
                class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center"
              >
                <svg
                  class="w-6 h-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3
                class="text-sm uppercase tracking-[0.2em] text-red-900 font-bold"
              >
                {{ title() }}
              </h3>
            </div>
          </div>

          <!-- Content -->
          <div class="p-6">
            <p
              class="text-sm text-gray-700 whitespace-pre-line leading-relaxed"
            >
              {{ message() }}
            </p>
          </div>

          <!-- Actions -->
          <div class="bg-gray-50 border-t border-gray-100 p-6 flex space-x-3">
            <button
              (click)="onCancel()"
              class="flex-1 bg-white border-2 border-gray-200 text-gray-700 text-[10px] font-bold uppercase tracking-widest px-6 py-3 transition-all hover:bg-gray-50 hover:border-gray-300"
            >
              Annuler
            </button>
            <button
              (click)="onConfirm()"
              class="flex-1 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest px-6 py-3 transition-all hover:bg-red-700"
            >
              {{ confirmText() }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmModalComponent {
  show = signal(false);
  title = signal('Confirmation');
  message = signal('');
  confirmText = signal('Confirmer');

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  open(title: string, message: string, confirmText = 'Confirmer') {
    this.title.set(title);
    this.message.set(message);
    this.confirmText.set(confirmText);
    this.show.set(true);
  }

  close() {
    this.show.set(false);
  }

  onConfirm() {
    this.confirmed.emit();
    this.close();
  }

  onCancel() {
    this.cancelled.emit();
    this.close();
  }
}
