import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CarritoService, CarritoItem } from '../../services/carrito.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.scss'
})
export class CarritoComponent implements OnInit, OnDestroy {
  private carritoService = inject(CarritoService);
  private authService = inject(AuthService);
  private router = inject(Router);

  carritoItems: CarritoItem[] = [];
  total: number = 0;
  private subscription: Subscription = new Subscription();

  // DATOS BANCARIOS - ESTO DEBE ESTAR AQUI
  datosBanco = {
    nombre: 'Banco Estado',
    cuenta: '43100076889',
    titular: 'Denis Salinas Morales',
    rut: '13.855.826-6',
    tipo: 'Cuenta Corriente'
  };

  ngOnInit(): void {
    this.subscription = this.carritoService.getCarrito().subscribe(items => {
      this.carritoItems = items;
      this.calcularTotal();
    });
  }

  ngOnDestroy(): void {
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

  generarMensajeWhatsApp(): string {
    const user = this.authService.getCurrentUser();
    const nombre = user?.displayName || user?.email?.split('@')[0] || 'Cliente';
    const email = user?.email || 'No especificado';

    let detalleProductos = '';
    this.carritoItems.forEach(item => {
      detalleProductos += `• ${item.name}\n   Precio: $${item.price.toLocaleString('es-CL')} x ${item.quantity} = $${(item.price * item.quantity).toLocaleString('es-CL')}\n`;
    });

    const fecha = new Date();
    const fechaStr = fecha.toLocaleDateString('es-CL');
    const horaStr = fecha.toLocaleTimeString('es-CL');
    const nroPedido = fecha.getTime();

    return `🛒 *NUEVO PEDIDO - REMATEZONE* 🛒

👤 *Datos del Cliente:*
Nombre: ${nombre}
Email: ${email}

📦 *Productos:*
${detalleProductos}

💰 *Total a Pagar:* $${this.total.toLocaleString('es-CL')}

📅 Fecha: ${fechaStr} - ${horaStr}
🆔 N° Pedido: ${nroPedido}

---
*DATOS PARA DEPÓSITO:*

Banco: ${this.datosBanco.nombre}
Cuenta: ${this.datosBanco.cuenta}
Titular: ${this.datosBanco.titular}
RUT: ${this.datosBanco.rut}
Tipo: ${this.datosBanco.tipo}

*Monto a depositar:* $${this.total.toLocaleString('es-CL')}
*Referencia:* Pedido ${nroPedido}

---
✅ *Instrucciones:*
1. Realiza el depósito por el monto exacto
2. Envía el comprobante a este mismo chat
3. Confirma tu pago con tu nombre y número de pedido

📌 *Importante:* El pedido se procesará al recibir la confirmación del depósito.

¡Gracias por comprar en RemateZone! 🏠`;
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

    const mensaje = this.generarMensajeWhatsApp();
    const telefono = '56982627475';
    const urlWhatsApp = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

    window.open(urlWhatsApp, '_blank');
  }

  // METODO COPIAR DATOS - ESTO DEBE ESTAR AQUI
  copiarDatosBancarios(): void {
    const datos = `🏦 DATOS PARA DEPOSITO

Banco: ${this.datosBanco.nombre}
Cuenta: ${this.datosBanco.cuenta}
Titular: ${this.datosBanco.titular}
RUT: ${this.datosBanco.rut}
Tipo: ${this.datosBanco.tipo}
Monto: $${this.total.toLocaleString('es-CL')}`;

    navigator.clipboard.writeText(datos)
      .then(() => alert('✅ Datos bancarios copiados'))
      .catch(() => alert('❌ Error al copiar'));
  }

  getCantidadTotal(): number {
    return this.carritoItems.reduce((total, item) => total + item.quantity, 0);
  }
}
