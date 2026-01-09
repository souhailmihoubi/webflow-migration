import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { tunisianPhoneValidator } from '../shared/validators/phone.validator';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './contact.component.html',
})
export class ContactComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  contactForm: FormGroup;
  isSubmitting = signal(false);
  submitMessage = signal<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  contactInfo = {
    address:
      '126, AV Hédi Nouira Cité les jasmins en face station de garde national Mora 8000 Nabeul, Tunisia',
    phones: ['+216 29 137 955', '+216 29 654 800'],
    email: 'lartistou.meuble@yahoo.com',
    hours: [
      { day: 'Lundi - Samedi', time: '09:00 - 19:00' },
      { day: 'Dimanche', time: 'Fermé' },
    ],
  };

  constructor() {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.email]],
      phone: ['', [Validators.required, tunisianPhoneValidator]],
      subject: ['', [Validators.required, Validators.minLength(3)]],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  onSubmit() {
    // Mark all fields as touched to show validation errors
    this.contactForm.markAllAsTouched();

    if (this.contactForm.invalid) return;

    this.isSubmitting.set(true);
    this.submitMessage.set(null);

    const formData = this.contactForm.value;

    this.http.post(`${environment.apiUrl}/contact`, formData).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.submitMessage.set({
          type: 'success',
          text: 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
        });
        this.contactForm.reset();

        // Clear message after 5 seconds
        setTimeout(() => this.submitMessage.set(null), 5000);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.submitMessage.set({
          type: 'error',
          text:
            error.error?.message ||
            'Une erreur est survenue. Veuillez réessayer plus tard.',
        });
      },
    });
  }

  // Helper method to check if a field has an error
  hasError(fieldName: string, errorType?: string): boolean {
    const control = this.contactForm.get(fieldName);
    if (!control || !control.touched) return false;
    if (errorType) {
      return control.hasError(errorType);
    }
    return control.invalid;
  }

  // Helper to get phone validation error message
  getPhoneError(): string | null {
    const control = this.contactForm.get('phone');
    if (!control || !control.touched || !control.errors) return null;
    if (control.errors['required']) return 'Le numéro de téléphone est requis';
    if (control.errors['tunisianPhone'])
      return control.errors['tunisianPhone'].message;
    return null;
  }
}
