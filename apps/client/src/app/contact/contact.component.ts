import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './contact.component.html',
})
export class ContactComponent {
  private fb = inject(FormBuilder);

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
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required]],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  onSubmit() {
    if (this.contactForm.invalid) return;

    this.isSubmitting.set(true);
    this.submitMessage.set(null);

    // Simulate API call
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.submitMessage.set({
        type: 'success',
        text: 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
      });
      this.contactForm.reset();

      // Clear message after 5 seconds
      setTimeout(() => this.submitMessage.set(null), 5000);
    }, 1500);
  }
}
