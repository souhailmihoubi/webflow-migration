import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../shared/services/admin.service';
import { Pack } from '../../shared/services/pack.service';
import { Product } from '../../shared/services/product.service';
import { ToastService } from '../../shared/services/toast.service';
import { ImageUploadComponent } from '../../shared/components/image-upload/image-upload.component';

@Component({
  selector: 'app-pack-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ImageUploadComponent,
  ],
  templateUrl: './pack-form.component.html',
})
export class PackFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  private adminService = inject(AdminService);

  packId = signal<string | null>(null);
  isEditMode = computed(() => !!this.packId());
  isLoading = signal(true); // Changed initial value to true as per instruction
  isSaving = signal(false);

  // Products by category
  packs = signal<Pack[]>([]);
  products = signal<Product[]>([]);

  // Products by category
  samProducts = signal<Product[]>([]);
  cacProducts = signal<Product[]>([]);
  salonProducts = signal<Product[]>([]);

  // Calculated price
  calculatedPrice = signal<string | null>(null);

  categories = signal<any[]>([]);

  showModal = signal(false);
  editingPack = signal<Pack | null>(null);

  packForm = this.fb.group({
    name: ['', [Validators.required]],
    slug: ['', [Validators.required]],
    description: [''],
    mainImage: [''],
    productSamId: ['', [Validators.required]],
    productCacId: ['', [Validators.required]],
    productSalonId: ['', [Validators.required]],
    discountPercentage: [
      5,
      [Validators.required, Validators.min(0), Validators.max(100)],
    ],
    showInMenu: [true],
  });

  // Method to calculate price
  private calculatePrice() {
    const samId = this.packForm.get('productSamId')?.value;
    const cacId = this.packForm.get('productCacId')?.value;
    const salonId = this.packForm.get('productSalonId')?.value;
    const discountPercentage =
      this.packForm.get('discountPercentage')?.value || 0;

    const samProduct = this.samProducts().find((p) => p.id === samId);
    const cacProduct = this.cacProducts().find((p) => p.id === cacId);
    const salonProduct = this.salonProducts().find((p) => p.id === salonId);

    if (!samProduct || !cacProduct || !salonProduct) {
      this.calculatedPrice.set(null);
      return;
    }

    const samPrice = parseFloat(
      String(samProduct.discountPrice || samProduct.price),
    );
    const cacPrice = parseFloat(
      String(cacProduct.discountPrice || cacProduct.price),
    );
    const salonPrice = parseFloat(
      String(salonProduct.discountPrice || salonProduct.price),
    );

    const total = samPrice + cacPrice + salonPrice;
    const discountMultiplier = (100 - discountPercentage) / 100;
    const finalPrice = (total * discountMultiplier).toFixed(2);

    this.calculatedPrice.set(finalPrice);
  }

  ngOnInit() {
    // Check if editing
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.packId.set(params['id']);
        this.loadPack(params['id']);
      }
    });

    // Load products for each category
    this.loadProductsByCategory();

    // Auto-generate slug from name
    this.packForm.get('name')?.valueChanges.subscribe((name) => {
      if (name && !this.isEditMode()) {
        const slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        this.packForm.patchValue({ slug }, { emitEvent: false });
      }
    });

    // Subscribe to form changes to trigger price recalculation
    this.packForm.valueChanges.subscribe(() => {
      this.calculatePrice();
    });
  }

  loadProductsByCategory() {
    this.isLoading.set(true);

    // Get all products and filter by category
    this.adminService.getProducts({ limit: 1000 }).subscribe({
      next: (response: any) => {
        const products = Array.isArray(response)
          ? response
          : response.data || [];

        // Filter products by category slug
        this.products.set(products);

        this.samProducts.set(
          products.filter((p: Product) => p.category?.slug === 'sam'),
        );
        this.cacProducts.set(
          products.filter((p: Product) => p.category?.slug === 'cac'),
        );
        this.salonProducts.set(
          products.filter((p: Product) => p.category?.slug === 'salon'),
        );

        this.calculatePrice();
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading products:', error);
        this.isLoading.set(false);
      },
    });
  }

  loadPack(id: string) {
    this.isLoading.set(true);
    // Use admin endpoint to get pack by ID
    this.adminService.getAllPacks({ limit: 1000 }).subscribe({
      next: (response: any) => {
        const packs = Array.isArray(response) ? response : response.data || [];
        const pack = packs.find((p: any) => p.id === id);
        if (pack) {
          this.packForm.patchValue({
            name: pack.name,
            slug: pack.slug,
            description: pack.description,
            mainImage: pack.mainImage,
            productSamId: pack.productSamId,
            productCacId: pack.productCacId,
            productSalonId: pack.productSalonId,
            discountPercentage: pack.discountPercentage || 5,
            showInMenu: pack.showInMenu,
          });
        } else {
          this.toast.error('Pack non trouvé');
          this.router.navigate(['/admin/packs']);
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading pack:', error);
        this.toast.error('Erreur lors du chargement du pack');
        this.router.navigate(['/admin/packs']);
      },
    });
  }

  openEditModal(pack: Pack) {
    this.editingPack.set(pack);
    this.packForm.patchValue({
      name: pack.name,
      slug: pack.slug,
      description: pack.description,
      showInMenu: pack.showInMenu,
      mainImage: pack.mainImage,
      productSamId: pack.productSam.id,
      productCacId: pack.productCac.id,
      productSalonId: pack.productSalon.id,
      discountPercentage: pack.discountPercentage || 5, // Added this back based on original form
    });
    this.showModal.set(true);
  }

  onImageUploaded(url: string) {
    this.packForm.patchValue({ mainImage: url });
    this.packForm.get('mainImage')?.markAsTouched();
  }

  onSubmit() {
    if (this.packForm.invalid) {
      this.packForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const formData = this.packForm.value;

    const request = this.isEditMode()
      ? this.adminService.updatePack(this.packId()!, formData)
      : this.adminService.createPack(formData);

    request.subscribe({
      next: () => {
        this.toast.success(
          this.isEditMode()
            ? 'Pack modifié avec succès'
            : 'Pack créé avec succès',
        );
        this.router.navigate(['/admin/packs']);
      },
      error: (error: any) => {
        console.error('Error saving pack:', error);
        this.toast.error(
          "Erreur lors de l'enregistrement: " +
            (error.error?.message || error.message || 'Erreur inconnue'),
        );
        this.isSaving.set(false);
      },
    });
  }

  cancel() {
    this.router.navigate(['/admin/packs']);
  }
}
