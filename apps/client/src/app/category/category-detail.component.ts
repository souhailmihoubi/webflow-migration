import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
  private router = inject(Router);
  private categoryService = inject(CategoryService);

  category = signal<Category | null>(null);
  isLoading = signal(true);
  searchQuery = signal('');
  hasSearched = signal(false);

  // Price Filter
  minPrice = signal<number | undefined>(undefined);
  maxPrice = signal<number | undefined>(undefined);

  // Pagination
  currentPage = signal(1);
  itemsPerPage = 9;

  // Computed signal for filtered products
  filteredProducts = computed(() => {
    // Basic Client-side search (name/desc) on top of Server-side price filter
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
        switchMap((params) => {
          return this.route.queryParamMap.pipe(
            // Combine paramMap updates with queryParam updates
            switchMap((queryParams) => {
              const slug = params.get('slug');
              const min = queryParams.get('minPrice');
              const max = queryParams.get('maxPrice');

              this.isLoading.set(true);
              // Sync signals with URL params
              this.minPrice.set(min ? Number(min) : undefined);
              this.maxPrice.set(max ? Number(max) : undefined);

              if (!slug) return [];

              return this.categoryService.getCategoryBySlug(
                slug,
                this.minPrice(),
                this.maxPrice(),
              );
            }),
          );
        }),
      )
      .subscribe({
        next: (category) => {
          this.category.set(category);
          this.isLoading.set(false);
          // Reset pagination on new data fetch
          this.currentPage.set(1);
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

  applyPriceFilter(min: string, max: string) {
    const queryParams: any = {};
    if (min) queryParams.minPrice = min;
    if (max) queryParams.maxPrice = max;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge', // Merge with existing params (like if we had other filters)
    });
  }

  resetPriceFilter() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      queryParamsHandling: '', // Clear all query params
    });
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
