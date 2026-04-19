import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BidService } from '../../services/bid.service';
import { AuthService } from '../../services/auth.service';

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

  private bidService = inject(BidService);
  private authService = inject(AuthService);

  montoOferta: number = 0;
  loading = false;
  error = '';
  success = '';

  get montoMinimo(): number {
    if (!this.producto) return 0;
    return Math.ceil(this.producto.price * 1.1);
  }

  cerrar() {
    this.close.emit();
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
      // CORREGIDO: Solo enviar los campos que espera createBid
      await this.bidService.createBid({
        productId: this.producto.id,
        productName: this.producto.name,
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
