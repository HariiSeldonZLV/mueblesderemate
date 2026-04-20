import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BidService } from '../../services/bid.service';
import { AuthService } from '../../services/auth.service';
import { CarritoService } from '../../services/carrito.service'; // ← Importar

@Component({
  selector: 'app-puja-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './puja-modal.component.html',
  styleUrl: './puja-modal.component.scss'
})
export class PujaModalComponent {
  @Input() producto: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() bidSubmitted = new EventEmitter<any>();
  @Output() buyNow = new EventEmitter<any>(); // ← Nuevo evento

  private bidService = inject(BidService);
  private authService = inject(AuthService);
  private carritoService = inject(CarritoService); // ← Injectar

  montoOferta: number = 0;
  loading = false;
  error = '';
  success = '';

  get montoMinimo(): number {
  if (!this.producto) return 0;

  // Obtener el precio (funciona con 'price' o 'precio')
  const precio = this.producto.price || this.producto.precio;
  if (!precio) return 0;

  // Calcular 20% menos (mi ganancia es 20%)
  const precioOferta = precio * 0.8;

  // Redondear hacia arriba a la centena más cercana
  return Math.ceil(precioOferta / 100) * 100;
}

  cerrar() {
    this.close.emit();
  }

  comprarAhora() {
  if (!this.authService.isAuthenticated()) {
    this.error = 'Debes iniciar sesión para comprar';
    return;
  }

  this.loading = true;
  this.error = '';

  try {
    // Obtener valores de forma segura
    const id = this.producto.id;
    const name = this.producto.nombre || this.producto.name;
    const price = this.producto.precio || this.producto.price;
    const category = this.producto.categoria || this.producto.category;
    const image = this.producto.imagen || this.producto.images?.[0] || '';

    // Agregar al carrito
    this.carritoService.agregarProducto({
      id: id,
      name: name,
      price: price,
      category: category,
      image: image,
      quantity: 1
    });

    this.success = '¡Producto agregado al carrito! Redirigiendo...';
    this.buyNow.emit({ producto: this.producto });

    setTimeout(() => {
      this.cerrar();
    }, 1000);

  } catch (err) {
    console.error('Error al agregar al carrito:', err);
    this.error = 'Error al agregar al carrito';
    this.loading = false;
  }
}

  async enviarOferta() {
  if (!this.authService.isAuthenticated()) {
    this.error = 'Debes iniciar sesión para hacer una oferta';
    return;
  }

  if (!this.montoOferta || this.montoOferta < this.montoMinimo) {
    this.error = `La oferta mínima es $${this.montoMinimo.toLocaleString('es-CL')}`;
    return;
  }

  const user = this.authService.getCurrentUser();
  if (!user) {
    this.error = 'Usuario no encontrado';
    return;
  }

  this.loading = true;
  this.error = '';
  this.success = '';

  try {
    const productName = this.producto.nombre || this.producto.name;

    await this.bidService.createBid({
      productId: this.producto.id,
      productName: productName,
      userId: user.uid,
      userEmail: user.email || '',
      amount: this.montoOferta
    });

    this.success = '¡Oferta enviada con éxito!';
    this.bidSubmitted.emit({ productoId: this.producto.id, monto: this.montoOferta });

    setTimeout(() => {
      this.cerrar();
    }, 1500);

  } catch (err) {
    console.error('Error al enviar oferta:', err);
    this.error = 'Error al enviar la oferta. Intenta nuevamente.';
  } finally {
    this.loading = false;
  }
}
}
