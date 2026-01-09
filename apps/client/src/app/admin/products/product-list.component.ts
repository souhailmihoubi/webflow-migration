import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormArray,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AdminService } from '../../shared/services/admin.service';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal.component';
import { ToastService } from '../../shared/services/toast.service';
import { PaginationComponent } from '../../shared/components/pagination.component';
import { ImageUploadComponent } from '../../shared/components/image-upload/image-upload.component';
import { Product } from '../../shared/services/product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ConfirmModalComponent,
    PaginationComponent,
    ImageUploadComponent,
  ],
  templateUrl: './product-list.component.html',
})
export class ProductListComponent implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  private http = inject(HttpClient); // Inject HttpClient

  products = signal<Product[]>([]);
  totalItems = signal(0);
  currentPage = signal(1);
  itemsPerPage = signal(10);

  categories = signal<any[]>([]); // Should be Category[] but any for now to avoid breaking if not imported
  isLoading = signal(true);
  isSaving = signal(false);
  isUploading = signal(false); // New signal for upload state

  // Filter properties
  searchTerm = signal('');
  selectedCategory = signal<string>('all');

  showModal = signal(false);
  editingProduct = signal<Product | null>(null);
  productForm: FormGroup;

  @ViewChild(ConfirmModalComponent) confirmModal!: ConfirmModalComponent;

  productIdToDelete: string | null = null;

  constructor() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required]],
      slug: ['', [Validators.required]],
      productDescription: ['', [Validators.required]],
      priceDetails: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      discountPrice: [null],
      categoryId: ['', [Validators.required]],
      mainImage: ['', [Validators.required]],
      multiImages: this.fb.array([]),
      videoLink: [''],
      showInMenu: [true],
      visible: [true],
    });
  }

  get multiImages() {
    return this.productForm.get('multiImages') as FormArray;
  }

  ngOnInit() {
    this.loadInitialData();
  }

  loadInitialData() {
    // Load categories first
    this.adminService.getCategories().subscribe({
      next: (response: any) => {
        // Categories might return array or paged object now?
        // AdminService.getCategories now returns observable of any.
        // Need to check if it returns array or {data...}
        const cats = Array.isArray(response) ? response : response.data || [];
        this.categories.set(cats);
      },
      error: (err) => console.error('Error loading categories:', err),
    });

    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);

    const params: any = {
      page: this.currentPage(),
      limit: this.itemsPerPage(),
    };

    if (this.searchTerm()) {
      params.search = this.searchTerm();
    }

    if (this.selectedCategory() !== 'all') {
      params.categoryId = this.selectedCategory();
    }

    this.adminService.getProducts(params).subscribe({
      next: (response: any) => {
        // Handle paginated response
        const data = response.data || [];
        const total = response.total || 0;

        this.products.set(data);
        this.totalItems.set(total);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Error loading products:', err);
        this.isLoading.set(false);
      },
    });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadData();
  }

  applyFilters() {
    this.currentPage.set(1);
    this.loadData();
  }

  onSearchChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.applyFilters();
  }

  onCategoryChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedCategory.set(value);
    this.applyFilters();
  }

  clearFilters() {
    this.searchTerm.set('');
    this.selectedCategory.set('all');
    this.applyFilters();
  }

  get totalCount() {
    return this.totalItems();
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

  openEditModal(product: Product) {
    this.editingProduct.set(product);
    this.multiImages.clear();

    this.productForm.patchValue({
      name: product.name,
      slug: product.slug,
      productDescription: product.productDescription,
      priceDetails: product.priceDetails || '',
      price: product.price,
      discountPrice: product.discountPrice,
      categoryId: product.category.id,
      mainImage: product.mainImage,
      videoLink: product.videoLink || '',
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

  onMainImageUploaded(url: string) {
    this.productForm.patchValue({ mainImage: url });
    this.productForm.get('mainImage')?.markAsTouched();
  }

  onAdditionalImageUploaded(index: number, url: string) {
    this.multiImages.at(index).setValue(url);
    this.multiImages.at(index).markAsTouched();
  }

  async onBulkImagesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const files = Array.from(input.files);
    this.isUploading.set(true);
    let completed = 0;
    let errors = 0;

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        this.toast.error(`L'image ${file.name} dépasse 5MB`, 3000);
        errors++;
        completed++;
        if (completed === files.length) {
          this.isUploading.set(false);
          input.value = '';
        }
        continue;
      }

      const formData = new FormData();
      formData.append('file', file);

      this.http
        .post<{
          url: string;
        }>(`${environment.apiUrl}/upload/product-image`, formData)
        .subscribe({
          next: (response) => {
            this.multiImages.push(this.fb.control(response.url));
            completed++;
            if (completed === files.length) {
              this.isUploading.set(false);
              this.toast.success(
                `${files.length - errors} image(s) ajoutée(s)`,
              );
              input.value = '';
            }
          },
          error: (err) => {
            console.error(`Error uploading ${file.name}:`, err);
            this.toast.error(`Échec pour ${file.name}`);
            errors++;
            completed++;
            if (completed === files.length) {
              this.isUploading.set(false);
              input.value = '';
            }
          },
        });
    }
  }

  onSubmit() {
    // Prevent duplicate submissions
    if (this.isSaving() || this.isUploading()) {
      return;
    }

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();

      // Build specific error message
      const errors: string[] = [];
      if (this.productForm.get('name')?.invalid)
        errors.push('- Nom du produit');
      if (this.productForm.get('slug')?.invalid) errors.push('- Slug');
      if (this.productForm.get('productDescription')?.invalid)
        errors.push('- Description');
      if (this.productForm.get('price')?.invalid) errors.push('- Prix');
      if (this.productForm.get('categoryId')?.invalid)
        errors.push('- Catégorie');
      if (this.productForm.get('mainImage')?.invalid)
        errors.push('- Image principale');

      this.toast.error(
        'Champs requis manquants :\n\n' + errors.join('\n'),
        4000,
      );
      return;
    }

    this.isSaving.set(true);

    // Prepare payload matching CreateProductDto/UpdateProductDto
    const formValue = this.productForm.value;
    const payload: any = {
      name: formValue.name,
      slug: formValue.slug,
      productDescription: formValue.productDescription,
      price: Number(formValue.price),
      categoryId: formValue.categoryId,
      mainImage: formValue.mainImage,
      showInMenu: formValue.showInMenu ?? false,
      multiImages: formValue.multiImages || [],
    };

    if (formValue.discountPrice) {
      payload.discountPrice = Number(formValue.discountPrice);
    }

    if (formValue.priceDetails) {
      payload.priceDetails = formValue.priceDetails;
    }

    if (formValue.videoLink) {
      payload.videoLink = formValue.videoLink;
    }

    if (formValue.discountPrice) {
      payload.discountPrice = Number(formValue.discountPrice);
    }

    const editing = this.editingProduct();

    const obs = editing
      ? this.adminService.updateProduct(editing.id, payload)
      : this.adminService.createProduct(payload);

    obs.subscribe({
      next: () => {
        this.toast.success(
          editing ? 'Produit modifié avec succès' : 'Produit créé avec succès',
        );
        this.closeModal();
        this.loadData();
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Error saving product:', err);
        this.toast.error(
          "Erreur lors de l'enregistrement: " +
            (err.error?.message || err.message || 'Erreur inconnue'),
        );
        this.isSaving.set(false);
      },
    });
  }

  deleteProduct(id: string, name: string) {
    this.productIdToDelete = id;
    this.confirmModal.open(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer le produit "${name}" ?\n\nCette action est irréversible.`,
      'Supprimer',
    );
  }

  onConfirmDelete() {
    const id = this.productIdToDelete;
    if (!id) return;

    this.adminService.deleteProduct(id).subscribe({
      next: () => {
        this.toast.success('Produit supprimé avec succès');
        this.loadData();
      },
      error: (err) => {
        console.error('Error deleting product:', err);
        this.toast.error(
          'Erreur lors de la suppression: ' +
            (err.error?.message || err.message),
        );
      },
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
