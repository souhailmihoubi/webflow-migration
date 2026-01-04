import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../shared/services/admin.service';

@Component({
  selector: 'app-pack-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pack-list.component.html',
})
export class PackListComponent implements OnInit {
  private adminService = inject(AdminService);

  packs = signal<any[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.loadPacks();
  }

  loadPacks() {
    this.isLoading.set(true);
    this.adminService.getAllPacks().subscribe({
      next: (packs) => {
        this.packs.set(packs);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading packs:', error);
        this.isLoading.set(false);
      },
    });
  }

  deletePack(id: string, name: string) {
    // Direct delete without confirm for testing
    console.log('Delete pack called for:', id, name);
    this.adminService.deletePack(id).subscribe({
      next: () => {
        console.log('Pack deleted successfully');
        this.loadPacks();
        alert('Pack supprimé avec succès');
      },
      error: (error) => {
        console.error('Error deleting pack:', error);
        alert('Erreur lors de la suppression du pack: ' + (error.message || 'Erreur inconnue'));
      },
    });
  }
}
