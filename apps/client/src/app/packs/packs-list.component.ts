import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PackService, Pack } from '../shared/services/pack.service';

@Component({
  selector: 'app-packs-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './packs-list.component.html',
})
export class PacksListComponent implements OnInit {
  private packService = inject(PackService);

  packs = signal<Pack[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.packService.fetchPacks().subscribe({
      next: (packs) => {
        this.packs.set(packs);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error fetching packs:', error);
        this.isLoading.set(false);
      },
    });
  }
}
