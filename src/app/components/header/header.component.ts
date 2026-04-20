import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  authService = inject(AuthService);
  private carritoService = inject(CarritoService);
  private router = inject(Router);

  getCantidadCarrito(): number {
    return this.carritoService.getCantidadItems();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
