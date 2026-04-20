import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CarritoService, CarritoItem } from '../../services/carrito.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs'; // <-- Importa Subscription

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.scss'
})
export class CarritoComponent implements OnInit, OnDestroy { // <-- Implementa OnDestroy
  private carritoService = inject(CarritoService);
  private authService = inject(AuthService);
  private router = inject(Router);

  carritoItems: CarritoItem[] = [];
  total: number = 0;
  private subscription: Subscription = new Subscription(); // <-- Para la suscripción

  ngOnInit(): void {
    // Suscribirse a los cambios del carrito en tiempo real
    this.subscription = this.carritoService.getCarrito().subscribe(items => {
      this.carritoItems = items;
      this.calcularTotal();
      console.log('Carrito actualizado:', this.carritoItems); // <-- Para depurar
    });
  }

  ngOnDestroy(): void {
    // Limpiar la suscripción al destruir el componente
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  calcularTotal(): void {
    this.total = this.carritoItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  actualizarCantidad(item: CarritoItem, cantidad: number): void {
    if (cantidad < 1) {
      this.eliminarProducto(item);
    } else {
      this.carritoService.actualizarCantidad(item.id, cantidad);
    }
  }

  eliminarProducto(item: CarritoItem): void {
    if (confirm(`¿Eliminar "${item.name}" del carrito?`)) {
      this.carritoService.eliminarProducto(item.id);
    }
  }

  vaciarCarrito(): void {
    if (confirm('¿Vaciar completamente el carrito?')) {
      this.carritoService.vaciarCarrito();
    }
  }

  continuarComprando(): void {
    this.router.navigate(['/productos']);
  }

  procederAlPago(): void {
    if (!this.authService.isAuthenticated()) {
      alert('Debes iniciar sesión para proceder al pago');
      this.router.navigate(['/login']);
      return;
    }

    if (this.carritoItems.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    alert('🛒 Funcionalidad de pago en desarrollo. Total a pagar: $' + this.total.toLocaleString('es-CL'));
  }

  getCantidadTotal(): number {
    return this.carritoItems.reduce((total, item) => total + item.quantity, 0);
  }
}
