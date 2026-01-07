import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../shared/auth/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  token = '';
  newPassword = '';
  confirmPassword = '';
  isLoading = false;
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'];
      if (!this.token) {
        this.errorMessage.set('Jeton invalide ou manquant.');
      }
    });
  }

  onSubmit() {
    if (!this.token) {
      this.errorMessage.set('Jeton invalide.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage.set('Les mots de passe ne correspondent pas.');
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMessage.set(
        'Le mot de passe doit contenir au moins 6 caractères.',
      );
      return;
    }

    this.isLoading = true;
    this.errorMessage.set(null);

    this.authService
      .resetPassword({ token: this.token, newPassword: this.newPassword })
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          this.successMessage.set(res.message);
          setTimeout(() => {
            this.router.navigate(['/']); // Redirect to home
            // Optionally open login modal here if possible
            this.authService.openAuthModal();
          }, 3000);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage.set(
            err.error?.message ||
              'La réinitialisation du mot de passe a échoué.',
          );
        },
      });
  }
}
