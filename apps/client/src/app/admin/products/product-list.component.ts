import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormArray,
} from '@angular/forms';
import { AdminService } from '../../shared/services/admin.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-list.component.html',
})
export class ProductListComponent implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);

  products = signal<any[]>([]);
  categories = signal<any[]>([]);
  isLoading = signal(true);
  isSaving = signal(false);

  showModal = signal(false);
  editingProduct = signal<any | null>(null);
  productForm: FormGroup;

  constructor() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required]],
      slug: ['', [Validators.required]],
      description: ['', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0)]],
      discountPrice: [null],
      categoryId: ['', [Validators.required]],
      mainImage: ['', [Validators.required]],
      multiImages: this.fb.array([]),
      showInMenu: [true],
      visible: [true],
    });
  }

  get multiImages() {
    return this.productForm.get('multiImages') as FormArray;
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    // Load categories first for the dropdown
    this.adminService
      .getCategories()
      .subscribe((cats) => this.categories.set(cats));

    this.adminService.getProducts().subscribe({
      next: (data) => {
        this.products.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.isLoading.set(false);
      },
    });
  }

  addImage() {
    this.multiImages.push(this.fb.control(''));
  }

  removeImage(index: number) {
    this.multiImages.removeAt(index);
  }

  openCreateModal() {
    this.editingProduct.set(null);
    this.productForm.reset({ price: 0, showInMenu: true, visible: true });
    this.multiImages.clear();
    this.showModal.set(true);
  }

  openEditModal(product: any) {
    this.editingProduct.set(product);
    this.multiImages.clear();

    this.productForm.patchValue({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice,
      categoryId: product.categoryId,
      mainImage: product.mainImage,
      showInMenu: product.showInMenu,
      visible: product.visible,
    });

    if (product.multiImages) {
      product.multiImages.forEach((img: string) => {
        this.multiImages.push(this.fb.control(img));
      });
    }

    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  onSubmit() {
    if (this.productForm.invalid) return;

    this.isSaving.set(true);
    const data = this.productForm.value;
    const editing = this.editingProduct();

    const obs = editing
      ? this.adminService.updateProduct(editing.id, data)
      : this.adminService.createProduct(data);

    obs.subscribe({
      next: () => {
        this.loadData();
        this.isSaving.set(false);
        this.closeModal();
      },
      error: (err) => {
        console.error('Error saving product:', err);
        this.isSaving.set(false);
      },
    });
  }

  deleteProduct(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

    this.adminService.deleteProduct(id).subscribe({
      next: () => this.loadData(),
      error: (err) => console.error('Error deleting product:', err),
    });
  }

  generateSlug() {
    const name = this.productForm.get('name')?.value;
    if (name && !this.productForm.get('slug')?.dirty) {
      const slug = name
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');
      this.productForm.patchValue({ slug });
    }
  }
}
