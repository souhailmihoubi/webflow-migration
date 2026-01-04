import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../shared/services/admin.service';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal.component';
import { ToastService } from '../../shared/services/toast.service';
import { PaginationComponent } from '../../shared/components/pagination.component';

@Component({
  selector: 'app-pack-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ConfirmModalComponent,
    PaginationComponent,
  ],
  templateUrl: './pack-list.component.html',
})
export class PackListComponent implements OnInit {
  private adminService = inject(AdminService);
  private toast = inject(ToastService);

  packs = signal<any[]>([]);
  totalItems = signal(0);
  itemsPerPage = signal(10);
  currentPage = signal(1);
  isLoading = signal(true);

  searchTerm = signal('');

  @ViewChild(ConfirmModalComponent) confirmModal!: ConfirmModalComponent;

  ngOnInit() {
    this.loadPacks();
  }

  loadPacks() {
    this.isLoading.set(true);

    const params: any = {
      page: this.currentPage(),
      limit: this.itemsPerPage(),
    };

    if (this.searchTerm()) {
      params.search = this.searchTerm();
    }

    this.adminService.getAllPacks(params).subscribe({
      next: (response: any) => {
        const data = response.data || [];
        const total = response.total || 0;

        this.packs.set(data);
        this.totalItems.set(total);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading packs:', error);
        this.isLoading.set(false);
      },
    });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadPacks();
  }

  applyFilters() {
    this.currentPage.set(1);
    this.loadPacks();
  }

  onSearchChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.applyFilters();
  }

  clearSearch() {
    this.searchTerm.set('');
    this.applyFilters();
  }

  deletePack(id: string, name: string) {
    this.confirmModal.open(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer le pack "${name}" ?\n\nCette action est irréversible.`,
      'Supprimer',
    );

    (this.confirmModal as any)._pendingId = id;
  }

  onConfirmDelete() {
    const id = (this.confirmModal as any)._pendingId;
    if (!id) return;

    this.adminService.deletePack(id).subscribe({
      next: () => {
        this.toast.success('Pack supprimé avec succès');
        this.loadPacks();
      },
      error: (error) => {
        console.error('Error deleting pack:', error);
        this.toast.error(
          'Erreur lors de la suppression: ' +
            (error.error?.message || error.message || 'Erreur inconnue'),
        );
      },
    });
  }
}
