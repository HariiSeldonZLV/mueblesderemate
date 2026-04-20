import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUser();

  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};

// Guard específico para admin
export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUser();

  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  if (user.email !== 'admin@rematezone.cl') {
    alert('Acceso denegado. Solo administradores.');
    router.navigate(['/']);
    return false;
  }

  return true;
};
