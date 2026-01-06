import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (showButton()) {
      <button
        (click)="goBack()"
        class="hidden md:flex fixed top-24 left-8 z-40 items-center space-x-2 text-primary hover:text-accent transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-100"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-4 h-4"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
        <span class="text-xs font-bold uppercase tracking-widest">Retour</span>
      </button>
    }
  `,
})
export class BackButtonComponent {
  private location = inject(Location);
  private router = inject(Router);

  showButton = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => (event as NavigationEnd).urlAfterRedirects !== '/'),
    ),
    { initialValue: false },
  );

  goBack() {
    this.location.back();
  }
}
