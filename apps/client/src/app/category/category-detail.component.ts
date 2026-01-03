import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CategoryService, Category } from '../shared/services/category.service';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
} from 'rxjs';

@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category-detail.component.html',
})
export class CategoryDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private categoryService = inject(CategoryService);

  category = signal<Category | null>(null);
  isLoading = signal(true);
  searchQuery = signal('');
  hasSearched = signal(false);

  // Pagination
  currentPage = signal(1);
  itemsPerPage = 9;

  // Computed signal for filtered products
  filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const products = this.category()?.products || [];

    if (!query) return products;

    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.productDescription.toLowerCase().includes(query),
    );
  });

  // Computed signal for paginated products
  paginatedProducts = computed(() => {
    const products = this.filteredProducts();
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return products.slice(startIndex, startIndex + this.itemsPerPage);
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredProducts().length / this.itemsPerPage);
  });

  private searchSubject = new Subject<string>();

  ngOnInit() {
    // Handle category fetching
    this.route.paramMap
      .pipe(
        tap(() => {
          this.isLoading.set(true);
          this.searchQuery.set(''); // Reset search on category change
          this.hasSearched.set(false);
          this.currentPage.set(1); // Reset pagination on category change
        }),
        switchMap((params) => {
          const slug = params.get('slug');
          return slug ? this.categoryService.getCategoryBySlug(slug) : [];
        }),
      )
      .subscribe({
        next: (category) => {
          this.category.set(category);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error fetching category:', error);
          this.isLoading.set(false);
        },
      });

    // Handle internal search debouncing
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((query) => {
        this.searchQuery.set(query);
        this.hasSearched.set(query.length > 0);
        this.currentPage.set(1); // Reset pagination on search
      });
  }

  onLocalSearch(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    this.searchSubject.next(query);
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
