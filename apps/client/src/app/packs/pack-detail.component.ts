import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PackService, Pack } from '../shared/services/pack.service';
import { CartService } from '../shared/services/cart.service';
import { switchMap, tap, of } from 'rxjs';

@Component({
  selector: 'app-pack-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pack-detail.component.html',
})
export class PackDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private packService = inject(PackService);
  private cartService = inject(CartService);

  pack = signal<Pack | null>(null);
  isLoading = signal(true);
  showSuccess = signal(false);
  similarPacks = signal<Pack[]>([]);

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
          return this.packService.getPackBySlug(slug);
        }),
      )
      .subscribe({
        next: (pack) => {
          this.pack.set(pack);
          this.isLoading.set(false);

          // Load similar packs (other packs excluding current one)
          if (pack) {
            this.loadSimilarPacks(pack.id);
          }
        },
        error: (error) => {
          console.error('Error fetching pack detail:', error);
          this.isLoading.set(false);
        },
      });
  }

  loadSimilarPacks(currentPackId: string) {
    this.packService.fetchPacks().subscribe({
      next: (packs) => {
        // Filter out current pack and limit to 3 similar packs
        const filtered = packs
          .filter((p) => p.id !== currentPackId)
          .slice(0, 3);
        this.similarPacks.set(filtered);
      },
      error: (error) => {
        console.error('Error fetching similar packs:', error);
      },
    });
  }

  addToCart(pack: Pack) {
    this.cartService.addPackToCart(pack);
    this.showSuccess.set(true);
    setTimeout(() => this.showSuccess.set(false), 3000);
  }

  calculateOriginalPrice(pack: Pack): number {
    const samPrice =
      typeof pack.productSam.discountPrice === 'number'
        ? pack.productSam.discountPrice
        : parseFloat(
            String(pack.productSam.discountPrice || pack.productSam.price),
          );

    const cacPrice =
      typeof pack.productCac.discountPrice === 'number'
        ? pack.productCac.discountPrice
        : parseFloat(
            String(pack.productCac.discountPrice || pack.productCac.price),
          );

    const salonPrice =
      typeof pack.productSalon.discountPrice === 'number'
        ? pack.productSalon.discountPrice
        : parseFloat(
            String(pack.productSalon.discountPrice || pack.productSalon.price),
          );

    return samPrice + cacPrice + salonPrice;
  }
}
