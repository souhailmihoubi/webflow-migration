import {
  Component,
  inject,
  OnInit,
  computed,
  signal,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategoryService } from '../shared/services/category.service';
import { ProductService } from '../shared/services/product.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit, OnDestroy {
  private categoryService = inject(CategoryService);
  private productService = inject(ProductService);

  // Computed signal to get only categories for home page
  featuredCategories = computed(() =>
    this.categoryService.categories().filter((cat) => cat.showInHomePage),
  );

  // Filtered products for menu/promo
  promoProducts = computed(() =>
    this.productService.products().filter((p) => p.showInMenu),
  );

  // Countdown state
  countdown = signal({ days: '00', hours: '00', minutes: '00', seconds: '00' });
  private timerInterval: ReturnType<typeof setInterval> | undefined;

  ngOnInit() {
    this.categoryService.fetchCategories().subscribe();
    this.productService.fetchProducts().subscribe();
    this.startCountdown();
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  private startCountdown() {
    // Basic countdown to end of month
    const now = new Date();
    const targetDate = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    const updateTimer = () => {
      const current = new Date().getTime();
      const distance = targetDate.getTime() - current;

      if (distance < 0) {
        this.countdown.set({
          days: '00',
          hours: '00',
          minutes: '00',
          seconds: '00',
        });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      this.countdown.set({
        days: days.toString().padStart(2, '0'),
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0'),
      });
    };

    updateTimer();
    this.timerInterval = setInterval(updateTimer, 1000);
  }
}
