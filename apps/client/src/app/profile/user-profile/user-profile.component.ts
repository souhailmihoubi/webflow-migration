import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../shared/auth/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-profile.component.html',
})
export class UserProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  profileForm: FormGroup;
  passwordForm: FormGroup;

  isLoading = signal(true);
  isSavingProfile = signal(false);
  isChangingPassword = signal(false);

  profileMessage = signal<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );
  passwordMessage = signal<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  constructor() {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: [{ value: '', disabled: true }],
      phone: ['', [Validators.pattern(/^[0-9+ ]{8,}$/)]],
    });

    this.passwordForm = this.fb.group(
      {
        oldPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  ngOnInit() {
    this.fetchProfile();
  }

  fetchProfile() {
    this.isLoading.set(true);
    this.authService.getProfile().subscribe({
      next: (user) => {
        this.profileForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone || '',
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching profile:', err);
        this.isLoading.set(false);
      },
    });
  }

  updateProfile() {
    if (this.profileForm.invalid) return;

    this.isSavingProfile.set(true);
    this.profileMessage.set(null);

    this.authService.updateProfile(this.profileForm.getRawValue()).subscribe({
      next: (updated) => {
        this.isSavingProfile.set(false);
        this.profileMessage.set({
          type: 'success',
          text: 'Profil mis à jour avec succès.',
        });
        setTimeout(() => this.profileMessage.set(null), 5000);
      },
      error: (err) => {
        this.isSavingProfile.set(false);
        this.profileMessage.set({
          type: 'error',
          text: 'Erreur lors de la mise à jour du profil.',
        });
      },
    });
  }

  changePassword() {
    if (this.passwordForm.invalid) return;

    this.isChangingPassword.set(true);
    this.passwordMessage.set(null);

    const { oldPassword, newPassword } = this.passwordForm.value;

    this.authService.changePassword({ oldPassword, newPassword }).subscribe({
      next: () => {
        this.isChangingPassword.set(false);
        this.passwordMessage.set({
          type: 'success',
          text: 'Mot de passe modifié avec succès.',
        });
        this.passwordForm.reset();
        setTimeout(() => this.passwordMessage.set(null), 5000);
      },
      error: (err) => {
        this.isChangingPassword.set(false);
        const errorMsg =
          err.error?.message ||
          'Erreur lors de la modification du mot de passe.';
        this.passwordMessage.set({ type: 'error', text: errorMsg });
      },
    });
  }

  private passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }
}
