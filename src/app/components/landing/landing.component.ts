import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';  // ← Agregar Router
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
  public authService = inject(AuthService);
  private productService = inject(ProductService);
  private router = inject(Router);  // ← Agregar Router

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

  irACategoria(categoria: string) {
    // Redirigir a la página de productos con el filtro
    this.router.navigate(['/productos'], { queryParams: { categoria: categoria } });
  }

  ofertar(producto: Product) {
    if (!this.authService.isAuthenticated()) {
      alert('Debes iniciar sesión para hacer una oferta');
      return;
    }
    this.productoSeleccionado = producto;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.productoSeleccionado = null;
  }

  onBidSubmitted(data: any) {
    console.log('Oferta enviada:', data);
    this.mostrarModal = false;
  }

  async logout() {
    await this.authService.logout();
  }
}
