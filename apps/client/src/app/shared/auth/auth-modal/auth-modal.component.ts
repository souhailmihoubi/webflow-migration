import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { getTunisianPhoneError } from '../../validators/phone.validator';
import { COUNTRY_CODES } from '../../constants/countries';

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
  successMessage = signal<string | null>(null);
  submitted = false;

  // Form Data
  loginData = { email: '', password: '' };
  registerData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    countryCode: '+216',
  };
  countryCodes = COUNTRY_CODES;
  forgotMwEmail = '';

  private authService = inject(AuthService);

  switchView(view: AuthView) {
    this.currentView = view;
    this.errorMessage.set(null); // Clear errors on view switch
    this.successMessage.set(null); // Clear success messages
    this.submitted = false;
  }

  onLogin() {
    this.submitted = true;
    this.isLoading = true;
    this.errorMessage.set(null);

    if (!this.loginData.email || !this.loginData.password) {
      this.isLoading = false;
      return;
    }

    if (!this.isValidEmail(this.loginData.email)) {
      this.isLoading = false;
      // Let the template show the error based on touched/submitted state
      // or optionally set a custom error message
      return;
    }

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
    this.submitted = true;
    this.isLoading = true;
    this.errorMessage.set(null);

    // Basic validation check
    if (
      !this.registerData.firstName ||
      !this.registerData.lastName ||
      !this.registerData.email ||
      !this.registerData.password ||
      !this.registerData.phone
    ) {
      this.isLoading = false;
      return;
    }

    if (!this.isValidEmail(this.registerData.email)) {
      this.isLoading = false;
      return;
    }

    const phoneError = getTunisianPhoneError(this.registerData.phone);
    if (phoneError) {
      this.isLoading = false;
      this.errorMessage.set(phoneError);
      return;
    }

    const payload = {
      firstName: this.registerData.firstName,
      lastName: this.registerData.lastName,
      email: this.registerData.email,
      password: this.registerData.password,
      phone: `${this.registerData.countryCode} ${this.registerData.phone}`,
    };

    this.authService.register(payload).subscribe({
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
    if (!this.loginData.email && !this.forgotMwEmail) {
      this.errorMessage.set('Veuillez entrer votre email');
      return;
    }

    // Use the email entered in the forgot password form (need to link it to correct model)
    // The previous code had a specific variable for this but let's make sure it's bound correctly in template
    const emailToSend = this.forgotMwEmail || this.loginData.email;

    this.isLoading = true;
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.authService.forgotPassword(emailToSend).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage.set(res.message);
        // Optional: switch back to login after delay
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage.set(err.error?.message || 'Une erreur est survenue.');
      },
    });
  }

  onClose() {
    this.closeModal.emit();
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  get isLoginFormValid(): boolean {
    return (
      !!this.loginData.email &&
      !!this.loginData.password &&
      this.isValidEmail(this.loginData.email)
    );
  }

  get isRegisterFormValid(): boolean {
    return (
      !!this.registerData.firstName &&
      !!this.registerData.lastName &&
      !!this.registerData.email &&
      this.isValidEmail(this.registerData.email) &&
      !!this.registerData.password &&
      this.registerData.password.length >= 6 &&
      !!this.registerData.phone &&
      getTunisianPhoneError(this.registerData.phone) === null
    );
  }
}
