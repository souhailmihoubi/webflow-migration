import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService, Product } from '../shared/services/product.service';
import { CartService } from '../shared/services/cart.service';
import { AuthService } from '../shared/auth/auth.service';
import { switchMap, tap, of, map } from 'rxjs';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);

  product = signal<Product | null>(null);

  relatedProducts = signal<Product[]>([]);
  isLoading = signal(true);
  activeImage = signal<string>('');
  showSuccess = signal(false);

  ngOnInit() {
    this.route.paramMap
      .pipe(
        tap(() => {
          this.isLoading.set(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }),
        switchMap((params) => {
          const slug = params.get('slug');
          if (!slug) return of(null);
          return this.productService.getProductBySlug(slug);
        }),
        switchMap((product) => {
          if (!product) return of({ product: null, related: [] });

          // After getting product, fetch related products from same category
          return this.productService.fetchProducts(product.category.id).pipe(
            map((related) => ({
              product,
              related: related.filter((p) => p.id !== product.id).slice(0, 3),
            })),
          );
        }),
      )
      .subscribe({
        next: ({ product, related }) => {
          if (product) {
            this.product.set(product);
            this.activeImage.set(product.mainImage);
            this.relatedProducts.set(related);
          }
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error fetching product detail:', error);
          this.isLoading.set(false);
        },
      });
  }

  setActiveImage(img: string) {
    this.activeImage.set(img);
  }

  get allImages(): string[] {
    const p = this.product();
    if (!p) return [];
    return [p.mainImage, ...(p.multiImages || [])];
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
    this.showSuccess.set(true);
    setTimeout(() => this.showSuccess.set(false), 3000);
  }
}
