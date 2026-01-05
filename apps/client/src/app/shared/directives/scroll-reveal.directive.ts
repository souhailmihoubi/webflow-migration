import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true,
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  private element = inject(ElementRef);
  private observer: IntersectionObserver | undefined;

  @Input() delay = '0ms';
  @Input() duration = '800ms';
  @Input() distance = '30px';
  @Input() threshold = 0.1;

  ngOnInit() {
    this.setupStyles();
    this.createObserver();
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setupStyles() {
    const el = this.element.nativeElement;
    el.style.opacity = '0';
    el.style.transform = `translateY(${this.distance})`;
    el.style.transition = `opacity ${this.duration} cubic-bezier(0.5, 0, 0, 1) ${this.delay}, transform ${this.duration} cubic-bezier(0.5, 0, 0, 1) ${this.delay}`;
    el.style.willChange = 'opacity, transform';
  }

  private createObserver() {
    const options = {
      root: null,
      threshold: this.threshold,
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.reveal();
          // Stop observing once revealed
          this.observer?.unobserve(entry.target);
        }
      });
    }, options);

    this.observer.observe(this.element.nativeElement);
  }

  private reveal() {
    const el = this.element.nativeElement;
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  }
}
