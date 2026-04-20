import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, map, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class authGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const isAuthenticated = this.authService.isAuthenticated();

    if (!isAuthenticated) {
      this.router.navigate(['/login']);
      return false;
    }

    // Verificar si es admin para la ruta /admin
    const currentUrl = this.router.url;
    if (currentUrl.includes('/admin')) {
      return this.authService.isAdmin$().pipe(
        take(1),
        map(isAdmin => {
          if (!isAdmin) {
            console.log('Acceso denegado: No eres administrador');
            this.router.navigate(['/']);
            return false;
          }
          return true;
        })
      );
    }

    return true;
  }
}
