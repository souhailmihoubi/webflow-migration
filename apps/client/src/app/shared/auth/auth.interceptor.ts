import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);
  const token = authService.getToken();

  let request = req;
  if (token) {
    request = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && token) {
        // Session expired or invalidated - auto logout
        authService.logout();

        // Check if it's a session invalidation message
        const message = error.error?.message || '';
        if (
          message.includes('Session expired') ||
          message.includes('another device')
        ) {
          toast.error(
            'Votre session a expiré. Vous avez été déconnecté car ce compte a été accédé depuis un autre appareil.',
            9000,
          );
        } else {
          toast.error('Session expirée. Veuillez vous reconnecter.', 9000);
        }

        // Redirect to home
        router.navigate(['/']);
      }
      return throwError(() => error);
    }),
  );
};
