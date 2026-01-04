import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../shared/services/admin.service';

@Component({
  selector: 'app-pack-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './pack-form.component.html',
})
export class PackFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private adminService = inject(AdminService);

  packId = signal<string | null>(null);
  isEditMode = computed(() => !!this.packId());
  isLoading = signal(false);
  isSaving = signal(false);

  // Products by category
  samProducts = signal<any[]>([]);
  cacProducts = signal<any[]>([]);
  salonProducts = signal<any[]>([]);

  // Calculated price as a regular signal
  calculatedPrice = signal<string | null>(null);

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
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.packId.set(id);
      this.loadPack(id);
    }

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
    this.adminService.getProducts().subscribe({
      next: (products: any[]) => {
        // Filter products by category slug
        this.samProducts.set(
          products.filter((p) => p.category?.slug === 'sam'),
        );
        this.cacProducts.set(
          products.filter((p) => p.category?.slug === 'cac'),
        );
        this.salonProducts.set(
          products.filter((p) => p.category?.slug === 'salons-et-sejours'),
        );
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isLoading.set(false);
      },
    });
  }

  loadPack(id: string) {
    this.isLoading.set(true);
    // Use admin endpoint to get pack by ID
    this.adminService.getAllPacks().subscribe({
      next: (packs) => {
        const pack = packs.find((p) => p.id === id);
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
          alert('Pack non trouvé');
          this.router.navigate(['/admin/packs']);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading pack:', error);
        alert('Erreur lors du chargement du pack');
        this.router.navigate(['/admin/packs']);
      },
    });
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
        alert(
          this.isEditMode()
            ? 'Pack modifié avec succès'
            : 'Pack créé avec succès',
        );
        this.router.navigate(['/admin/packs']);
      },
      error: (error) => {
        console.error('Error saving pack:', error);
        alert("Erreur lors de l'enregistrement du pack");
        this.isSaving.set(false);
      },
    });
  }

  cancel() {
    this.router.navigate(['/admin/packs']);
  }
}
