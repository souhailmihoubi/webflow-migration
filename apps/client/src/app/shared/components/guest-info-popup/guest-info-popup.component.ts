import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-guest-info-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guest-info-popup.component.html',
})
export class GuestInfoPopupComponent implements OnInit {
  isOpen = signal(false);

  ngOnInit() {
    // Check local storage to see if user has already dismissed it
    const hasSeenPopup = localStorage.getItem('hasSeenGuestPopup');
    if (!hasSeenPopup) {
      // Show popup after a short delay
      setTimeout(() => {
        this.isOpen.set(true);
      }, 2000);
    }
  }

  close() {
    this.isOpen.set(false);
    localStorage.setItem('hasSeenGuestPopup', 'true');
  }
}
