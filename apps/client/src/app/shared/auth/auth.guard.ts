import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUser();

  if (user) {
    return true;
  }

  // Redirect to home and open auth modal if not authenticated
  authService.openAuthModal();
  return router.parseUrl('/');
};

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUser();

  if (user && user.role === 'ADMIN') {
    return true;
  }

  // Redirect to home if not admin
  return router.parseUrl('/');
};
