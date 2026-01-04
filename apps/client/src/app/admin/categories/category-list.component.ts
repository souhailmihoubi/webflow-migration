import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AdminService } from '../../shared/services/admin.service';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-list.component.html',
})
export class CategoryListComponent implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);

  categories = signal<any[]>([]);
  isLoading = signal(true);
  isSaving = signal(false);

  showModal = signal(false);
  editingCategory = signal<any | null>(null);
  categoryForm: FormGroup;

  constructor() {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required]],
      slug: ['', [Validators.required]],
      description: [''],
      image: [''],
    });
  }

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.isLoading.set(true);
    this.adminService.getCategories().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.isLoading.set(false);
      },
    });
  }

  openCreateModal() {
    this.editingCategory.set(null);
    this.categoryForm.reset();
    this.showModal.set(true);
  }

  openEditModal(category: any) {
    this.editingCategory.set(category);
    this.categoryForm.patchValue({
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
    });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
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
        this.loadCategories();
        this.isSaving.set(false);
        this.closeModal();
      },
      error: (err) => {
        console.error('Error saving category:', err);
        this.isSaving.set(false);
      },
    });
  }

  deleteCategory(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?'))
      return;

    this.adminService.deleteCategory(id).subscribe({
      next: () => this.loadCategories(),
      error: (err) => console.error('Error deleting category:', err),
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
