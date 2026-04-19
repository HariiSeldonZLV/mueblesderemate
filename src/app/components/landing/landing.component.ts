import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { PujaModalComponent } from '../puja-modal/puja-modal.component';
import { AuthService } from '../../services/auth.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, PujaModalComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit {
  authService = inject(AuthService);
  private productService = inject(ProductService);
  private router = inject(Router);

  // Propiedades que usa el HTML
  productosRecientes: Product[] = [];
  loading = true;
  mostrarModal = false;
  productoSeleccionado: any = null;

  ngOnInit(): void {
    this.cargarProductosRecientes();
  }

  cargarProductosRecientes(): void {
    this.loading = true;
    this.productService.getProducts(4).subscribe({
      next: (products) => {
        this.productosRecientes = products;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando productos:', err);
        this.loading = false;
      }
    });
  }

  irACategoria(categoria: string): void {
    this.router.navigate(['/productos'], { queryParams: { categoria: categoria } });
  }

  ofertar(producto: Product): void {
    if (!this.authService.isAuthenticated()) {
      alert('Debes iniciar sesión para hacer una oferta');
      return;
    }
    this.productoSeleccionado = producto;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.productoSeleccionado = null;
  }

  onBidSubmitted(data: any): void {
    console.log('Oferta enviada:', data);
    this.mostrarModal = false;
    alert('¡Oferta enviada con éxito!');
  }

  logout(): void {
    this.authService.logout();
  }
}
