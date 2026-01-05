import {
  Component,
  inject,
  OnInit,
  computed,
  signal,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategoryService } from '../shared/services/category.service';
import { ProductService } from '../shared/services/product.service';

import { ScrollRevealDirective } from '../shared/directives/scroll-reveal.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ScrollRevealDirective],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit, OnDestroy {
  private categoryService = inject(CategoryService);
  private productService = inject(ProductService);

  @ViewChild('productSlider') productSlider!: ElementRef<HTMLDivElement>;

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

  // Hero Slider
  heroImages = signal([
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?q=80&w=2000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1631679706909-1844bbd07221?q=80&w=2000&auto=format&fit=crop',
  ]);
  currentHeroSlide = signal(0);
  private heroSliderInterval: ReturnType<typeof setInterval> | undefined;

  // Slider auto-scroll logic
  private autoScrollInterval: ReturnType<typeof setInterval> | undefined;
  isPaused = false;

  // Drag-to-scroll logic
  private isDown = false;
  private startX = 0;
  private scrollLeft = 0;

  ngOnInit() {
    this.categoryService.fetchCategories().subscribe();
    this.productService.fetchProducts().subscribe();
    this.startCountdown();
    this.startAutoScroll();
    this.startHeroSlider();
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.autoScrollInterval) clearInterval(this.autoScrollInterval);
    if (this.heroSliderInterval) clearInterval(this.heroSliderInterval);
  }

  private startHeroSlider() {
    this.heroSliderInterval = setInterval(() => {
      this.currentHeroSlide.update(
        (val) => (val + 1) % this.heroImages().length,
      );
    }, 5000); // Change every 5 seconds
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

  private startAutoScroll() {
    this.autoScrollInterval = setInterval(() => {
      if (!this.isPaused && this.productSlider) {
        const el = this.productSlider.nativeElement;
        const scrollAmount = el.clientWidth / 2;

        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
          el.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
    }, 3000);
  }

  // --- Drag-to-scroll Handlers ---
  onMouseDown(e: MouseEvent) {
    this.isDown = true;
    this.isPaused = true;
    const el = this.productSlider.nativeElement;

    // Disable snapping and smooth scroll during drag
    el.style.scrollSnapType = 'none';
    el.style.scrollBehavior = 'auto';
    el.classList.add('cursor-grabbing');
    el.classList.remove('cursor-grab');

    this.startX = e.pageX - el.offsetLeft;
    this.scrollLeft = el.scrollLeft;
  }

  onMouseLeave() {
    if (!this.isDown) return;
    this.stopDragging();
  }

  onMouseUp() {
    if (!this.isDown) return;
    this.stopDragging();
  }

  onMouseMove(e: MouseEvent) {
    if (!this.isDown) return;
    e.preventDefault();
    const el = this.productSlider.nativeElement;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - this.startX) * 2; // Scroll speed
    el.scrollLeft = this.scrollLeft - walk;
  }

  private stopDragging() {
    this.isDown = false;
    this.isPaused = false;
    const el = this.productSlider.nativeElement;
    el.classList.remove('cursor-grabbing');
    el.classList.add('cursor-grab');

    // Re-enable snapping and smooth scroll
    el.style.scrollSnapType = 'x mandatory';
    el.style.scrollBehavior = 'smooth';
  }

  onMouseEnter() {
    this.isPaused = true;
  }

  onMouseOver() {
    this.isPaused = true;
  }
}
