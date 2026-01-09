import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-whatsapp-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (showButton$ | async) {
      <a
        href="https://wa.me/21629137955"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactez-nous sur WhatsApp"
        class="whatsapp-button"
      >
        <img
          src="https://webflow-migration-assets.s3.eu-west-3.amazonaws.com/whatsapp.png"
          alt="WhatsApp"
          class="whatsapp-icon"
        />
      </a>
    }
  `,
  styles: [
    `
      .whatsapp-button {
        position: fixed;
        bottom: 80px;
        right: 26px;
        z-index: 999;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 70px;
        height: 70px;
        border-radius: 50%;
        background: #25d366;
        box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
        cursor: pointer;
        transition:
          transform 0.2s ease,
          box-shadow 0.2s ease;
        animation: bounce 2s infinite ease-in-out;
      }

      .whatsapp-button:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 25px rgba(37, 211, 102, 0.6);
        animation-play-state: paused;
      }

      .whatsapp-icon {
        width: 50px;
        height: 50px;
        object-fit: contain;
      }

      @keyframes bounce {
        0%,
        100% {
          transform: translateY(0);
        }
        25% {
          transform: translateY(-6px);
        }
        50% {
          transform: translateY(0);
        }
        75% {
          transform: translateY(-3px);
        }
      }

      @media (max-width: 768px) {
        .whatsapp-button {
          bottom: 16px;
          right: 16px;
          width: 52px;
          height: 52px;
        }

        .whatsapp-icon {
          width: 30px;
          height: 30px;
        }
      }
    `,
  ],
})
export class WhatsappButtonComponent {
  private router = inject(Router);

  // Hide button on admin routes
  showButton$ = this.router.events.pipe(
    filter((event): event is NavigationEnd => event instanceof NavigationEnd),
    map((event) => !event.urlAfterRedirects.startsWith('/admin')),
    startWith(!this.router.url.startsWith('/admin')),
  );
}
