import {
  Component,
  EventEmitter,
  Output,
  ViewChild,
  ElementRef,
  AfterViewInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  forkJoin,
  of,
  finalize,
} from 'rxjs';
import { ProductService, Product } from '../../services/product.service';
import { CategoryService, Category } from '../../services/category.service';

@Component({
  selector: 'app-search-modal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './search-modal.component.html',
})
export class SearchModalComponent implements AfterViewInit {
  @Output() closeModal = new EventEmitter<void>();
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

  private searchSubject = new Subject<string>();

  searchResults = signal<{ products: Product[]; categories: Category[] }>({
    products: [],
    categories: [],
  });
  isSearching = signal(false);
  hasSearched = signal(false);

  constructor() {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          if (!query || query.length < 2) {
            this.hasSearched.set(false);
            return of({ products: [], categories: [] });
          }

          this.isSearching.set(true);
          this.hasSearched.set(true);

          return forkJoin({
            products: this.productService.searchProducts(query),
            categories: this.categoryService.searchCategories(query),
          }).pipe(finalize(() => this.isSearching.set(false)));
        }),
      )
      .subscribe((results) => {
        this.searchResults.set(results);
      });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.searchInput.nativeElement.focus();
    }, 100);
  }

  onSearch(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    this.searchSubject.next(query);
  }

  onClose() {
    this.closeModal.emit();
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.onClose();
    }
  }
}
