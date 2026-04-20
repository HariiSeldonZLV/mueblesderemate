import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CarritoItem {
  id: string | number;
  name: string;
  price: number;
  category: string;
  image?: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private carritoKey = 'carrito';
  private carritoSubject = new BehaviorSubject<CarritoItem[]>([]);

  constructor() {
    this.cargarCarrito();
  }

  private cargarCarrito(): void {
    const carritoGuardado = localStorage.getItem(this.carritoKey);
    if (carritoGuardado) {
      this.carritoSubject.next(JSON.parse(carritoGuardado));
    }
  }

  private guardarCarrito(items: CarritoItem[]): void {
    localStorage.setItem(this.carritoKey, JSON.stringify(items));
    this.carritoSubject.next(items);
  }

  getCarrito(): Observable<CarritoItem[]> {
    return this.carritoSubject.asObservable();
  }

  getCarritoValue(): CarritoItem[] {
    return this.carritoSubject.value;
  }

  agregarProducto(producto: CarritoItem): void {
    const items = this.getCarritoValue();
    const existente = items.find(item => item.id === producto.id);

    if (existente) {
      existente.quantity += 1;
      this.guardarCarrito(items);
    } else {
      this.guardarCarrito([...items, { ...producto, quantity: 1 }]);
    }
  }

  eliminarProducto(productoId: string | number): void {
    const items = this.getCarritoValue().filter(item => item.id !== productoId);
    this.guardarCarrito(items);
  }

  actualizarCantidad(productoId: string | number, cantidad: number): void {
    const items = this.getCarritoValue();
    const producto = items.find(item => item.id === productoId);

    if (producto) {
      if (cantidad <= 0) {
        this.eliminarProducto(productoId);
      } else {
        producto.quantity = cantidad;
        this.guardarCarrito(items);
      }
    }
  }

  vaciarCarrito(): void {
    this.guardarCarrito([]);
  }

  getTotal(): number {
    return this.getCarritoValue().reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getCantidadItems(): number {
    return this.getCarritoValue().reduce((total, item) => total + item.quantity, 0);
  }
}
