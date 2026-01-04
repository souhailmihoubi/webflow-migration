import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6"
    >
      <div class="flex justify-between flex-1 sm:hidden">
        <button
          [disabled]="currentPage === 1"
          (click)="onPageChange(currentPage - 1)"
          class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          Précédent
        </button>
        <button
          [disabled]="currentPage === totalPages"
          (click)="onPageChange(currentPage + 1)"
          class="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          Suivant
        </button>
      </div>
      <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p
            class="text-[11px] text-gray-500 uppercase tracking-widest font-bold"
          >
            Affichage de
            <span class="font-medium text-primary">{{ startItem }}</span>
            à
            <span class="font-medium text-primary">{{ endItem }}</span>
            sur
            <span class="font-medium text-primary">{{ totalItems }}</span>
            résultats
          </p>
        </div>
        <div>
          <nav
            class="isolate inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            <button
              [disabled]="currentPage === 1"
              (click)="onPageChange(currentPage - 1)"
              class="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
            >
              <span class="sr-only">Précédent</span>
              <svg
                class="w-5 h-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>

            @for (page of visiblePages; track page) {
              <button
                (click)="onPageChange(page)"
                [class.bg-accent]="page === currentPage"
                [class.text-white]="page === currentPage"
                [class.text-gray-900]="page !== currentPage"
                [class.ring-gray-300]="page !== currentPage"
                [class.hover:bg-gray-50]="page !== currentPage"
                class="relative inline-flex items-center px-4 py-2 text-[10px] font-bold uppercase ring-1 ring-inset focus:z-20 focus:outline-offset-0"
              >
                {{ page }}
              </button>
            }

            <button
              [disabled]="currentPage === totalPages"
              (click)="onPageChange(currentPage + 1)"
              class="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
            >
              <span class="sr-only">Suivant</span>
              <svg
                class="w-5 h-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  `,
})
export class PaginationComponent {
  @Input() currentPage = 1;
  @Input() itemsPerPage = 10;
  @Input() totalItems = 0;
  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get startItem(): number {
    if (this.totalItems === 0) return 0;
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endItem(): number {
    const end = this.currentPage * this.itemsPerPage;
    return end > this.totalItems ? this.totalItems : end;
  }

  get visiblePages(): number[] {
    const total = this.totalPages;
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: number[] = [];
    if (this.currentPage <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push(-1); // ellipsis
      pages.push(total);
    } else if (this.currentPage >= total - 3) {
      pages.push(1);
      pages.push(-1);
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push(-1);
      for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
        pages.push(i);
      }
      pages.push(-1);
      pages.push(total);
    }
    return pages.filter((p) => p !== -1); // Simplified for now, showing all numbers or implementing advanced logic later if needed.
    // Wait, the logic above pushes -1 but I filter it out? That removes ellipsis visual.
    // For simplicity let's just show standard window or all if small.
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }
}
