import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';

type AuthView = 'login' | 'register' | 'forgot-password';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-modal.component.html',
})
export class AuthModalComponent {
  @Output() closeModal = new EventEmitter<void>();
  currentView: AuthView = 'login';
  isLoading = false;
  errorMessage = signal<string | null>(null);

  // Form Data
  loginData = { email: '', password: '' };
  registerData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
  };
  forgotMwEmail = '';

  private authService = inject(AuthService);

  switchView(view: AuthView) {
    this.currentView = view;
    this.errorMessage.set(null); // Clear errors on view switch
  }

  onLogin() {
    this.isLoading = true;
    this.errorMessage.set(null);

    this.authService.login(this.loginData).subscribe({
      next: () => {
        this.isLoading = false;
        this.closeModal.emit();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Login error', err);
        this.errorMessage.set(
          err.error?.message || 'Login failed. Please check your credentials.',
        );
      },
    });
  }

  onRegister() {
    this.isLoading = true;
    this.errorMessage.set(null);

    // Split full name if needed or just use simple logic for now
    // NOTE: The previous form had "Nom complet" but backend wants firstName/lastName
    // We will assume the user enters "First Last" in the name field for this quick fix,
    // or better, we should update the form to match the API.
    // For now, let's just make sure the form model matches the API requirements.

    this.authService.register(this.registerData).subscribe({
      next: () => {
        this.isLoading = false;
        this.closeModal.emit();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage.set(
          err.error?.message || 'Registration failed. Please try again.',
        );
      },
    });
  }

  onForgotPassword() {
    // Logic for forgot password would go here
    this.switchView('login');
  }

  onClose() {
    this.closeModal.emit();
  }
}
