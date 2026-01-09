import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4">
      <div class="flex items-center space-x-4">
        <!-- Preview -->
        <div
          class="w-24 h-24 bg-gray-50 border border-gray-100 overflow-hidden relative group"
        >
          <img
            [src]="
              previewUrl ||
              'https://webflow-migration-assets.s3.eu-west-3.amazonaws.com/placeholder.png'
            "
            alt="Image preview"
            class="w-full h-full object-cover transition-opacity duration-300"
            [class.opacity-50]="isUploading"
          />
          @if (isUploading) {
            <div class="absolute inset-0 flex items-center justify-center">
              <div
                class="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"
              ></div>
            </div>
          }
        </div>

        <!-- Actions -->
        <div class="flex-1 space-y-2">
          <input
            #fileInput
            type="file"
            accept="image/*"
            class="hidden"
            (change)="onFileSelected($event)"
          />

          <button
            type="button"
            (click)="fileInput.click()"
            [disabled]="isUploading"
            class="px-4 py-2 bg-white border border-gray-200 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 hover:border-accent transition-colors disabled:opacity-50"
          >
            {{ previewUrl ? "Changer l'image" : 'Choisir une image' }}
          </button>

          @if (error) {
            <p class="text-xs text-red-500">{{ error }}</p>
          }
          @if (success) {
            <p class="text-xs text-green-500">Image téléchargée avec succès</p>
          }
        </div>
      </div>
    </div>
  `,
})
export class ImageUploadComponent {
  @Input() previewUrl: string | null = null;
  @Input() uploadPath = 'upload/product-image'; // Default path
  @Output() imageUploaded = new EventEmitter<string>();

  private http = inject(HttpClient);

  isUploading = false;
  error: string | null = null;
  success = false;

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.error = "L'image ne doit pas dépasser 5MB";
      return;
    }

    this.uploadImage(file);
  }

  uploadImage(file: File) {
    this.isUploading = true;
    this.error = null;
    this.success = false;

    const formData = new FormData();
    formData.append('file', file);

    this.http
      .post<{
        url: string;
      }>(`${environment.apiUrl}/${this.uploadPath}`, formData)
      .subscribe({
        next: (response) => {
          this.isUploading = false;
          this.previewUrl = response.url;
          this.success = true;
          this.imageUploaded.emit(response.url);
        },
        error: (err) => {
          console.error('Upload failed', err);
          this.isUploading = false;
          this.error = 'Échec du téléchargement. Réessayez.';
        },
      });
  }
}
