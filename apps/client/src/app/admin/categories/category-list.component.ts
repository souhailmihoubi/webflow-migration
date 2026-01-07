import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AdminService } from '../../shared/services/admin.service';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal.component';
import { ToastService } from '../../shared/services/toast.service';
import { PaginationComponent } from '../../shared/components/pagination.component';
import { ImageUploadComponent } from '../../shared/components/image-upload/image-upload.component';
import { Category } from '../../shared/services/category.service';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ConfirmModalComponent,
    PaginationComponent,
    ImageUploadComponent,
  ],
  templateUrl: './category-list.component.html',
})
export class CategoryListComponent implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  categories = signal<Category[]>([]);
  totalItems = signal(0);
  currentPage = signal(1);
  itemsPerPage = signal(10);

  isLoading = signal(true);
  isSaving = signal(false);

  searchTerm = signal('');

  showModal = signal(false);
  editingCategory = signal<Category | null>(null);
  categoryForm: FormGroup;

  @ViewChild(ConfirmModalComponent) confirmModal!: ConfirmModalComponent;

  categoryIdToDelete: string | null = null;

  constructor() {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required]],
      slug: ['', [Validators.required]],
      image: [''],
      showInHomePage: [false],
    });
  }

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.isLoading.set(true);
    const page = this.currentPage();
    const limit = this.itemsPerPage();
    const search = this.searchTerm();

    this.adminService.getCategories(page, limit, search).subscribe({
      next: (response: any) => {
        // Backend returns: { data, total, page, lastPage }
        // If the backend was previously returning just array, we need to handle that or assume new format is active.
        // Based on my backend changes, it returns { data, total, ... }
        this.categories.set(response.data);
        this.totalItems.set(response.total);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.isLoading.set(false);
      },
    });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadCategories();
  }

  // Note: Client-side filtering is replaced by server-side search
  applyFilters() {
    this.currentPage.set(1); // Reset to first page on new search
    this.loadCategories();
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

  openCreateModal() {
    this.editingCategory.set(null);
    this.categoryForm.reset();
    this.showModal.set(true);
  }

  openEditModal(category: Category) {
    this.editingCategory.set(category);
    this.categoryForm.patchValue({
      name: category.name,
      slug: category.slug,
      image: category.image,
      showInHomePage: category.showInHomePage,
    });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  onImageUploaded(url: string) {
    this.categoryForm.patchValue({ image: url });
    this.categoryForm.get('image')?.markAsTouched();
  }

  onSubmit() {
    if (this.categoryForm.invalid) return;

    this.isSaving.set(true);
    const data = this.categoryForm.value;
    const editing = this.editingCategory();

    const obs = editing
      ? this.adminService.updateCategory(editing.id, data)
      : this.adminService.createCategory(data);

    obs.subscribe({
      next: () => {
        this.toast.success(
          editing
            ? 'Catégorie modifiée avec succès'
            : 'Catégorie créée avec succès',
        );
        this.loadCategories();
        this.closeModal();
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Error saving category:', err);
        this.toast.error(
          'Erreur: ' + (err.error?.message || err.message || 'Erreur inconnue'),
        );
        this.isSaving.set(false);
      },
    });
  }

  deleteCategory(id: string, name: string) {
    this.categoryIdToDelete = id;
    this.confirmModal.open(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer la catégorie "${name}" ?\n\nCette action est irréversible.`,
      'Supprimer',
    );
  }

  onConfirmDelete() {
    const id = this.categoryIdToDelete;
    if (!id) return;

    this.adminService.deleteCategory(id).subscribe({
      next: () => {
        this.toast.success('Catégorie supprimée avec succès');
        this.loadCategories();
      },
      error: (err) => {
        console.error('Error deleting category:', err);
        this.toast.error(
          'Erreur lors de la suppression: ' +
            (err.error?.message || err.message),
        );
      },
    });
  }

  generateSlug() {
    const name = this.categoryForm.get('name')?.value;
    if (name && !this.categoryForm.get('slug')?.dirty) {
      const slug = name
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');
      this.categoryForm.patchValue({ slug });
    }
  }
}
