import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { CarritoService } from '../../services/carrito.service';
import { PujaModalComponent } from '../puja-modal/puja-modal.component';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, PujaModalComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit {
  private productService = inject(ProductService);
  public authService = inject(AuthService);
  private carritoService = inject(CarritoService);
  private router = inject(Router);

  productosRecientes: Product[] = [];
  loading = true;
  mostrarModal = false;
  productoSeleccionado: any = null;

  ngOnInit(): void {
    this.cargarProductosRecientes();
  }

  cargarProductosRecientes(): void {
    this.productService.getProducts().subscribe({
      next: (products: Product[]) => {
        this.productosRecientes = products.slice(0, 6);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error cargando productos:', err);
        this.loading = false;
      }
    });
  }

  irACategoria(categoria: string): void {
    this.router.navigate(['/productos'], { queryParams: { categoria: categoria } });
  }

  // Método para comprar ahora
  comprarAhora(producto: any): void {
    if (!this.authService.isAuthenticated()) {
      alert('Debes iniciar sesión para comprar');
      return;
    }

    this.carritoService.agregarProducto({
      id: producto.id,
      name: producto.name,
      price: producto.price,
      category: producto.category,
      image: producto.images?.[0] || '',
      quantity: 1
    });

    alert('✅ Producto agregado al carrito');
    this.router.navigate(['/carrito']);
  }

  ofertar(producto: any): void {
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

  onBuyNow(data: any): void {
    console.log('Compra ahora desde modal:', data);
    this.mostrarModal = false;
    this.router.navigate(['/carrito']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
