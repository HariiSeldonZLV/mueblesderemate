import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/product.model';
import { PujaModalComponent } from '../puja-modal/puja-modal.component';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PujaModalComponent],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.scss'
})
export class ProductosComponent implements OnInit {
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private carritoService = inject(CarritoService);

  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading = true;
  selectedCategory = 'todos';

  categories = [
    { value: 'todos', label: 'Todos' },
    { value: 'muebles', label: '🛋️ Muebles' },
    { value: 'electrodomesticos', label: '📺 Electrodomésticos' }
  ];

  mostrarModal = false;
  productoSeleccionado: any = null;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const categoria = params['categoria'];
      if (categoria === 'muebles' || categoria === 'electrodomesticos') {
        this.selectedCategory = categoria;
      } else {
        this.selectedCategory = 'todos';
      }
      this.loadProducts();
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (products: Product[]) => {
        this.products = products;
        this.applyFilter();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error cargando productos:', err);
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    if (this.selectedCategory === 'todos') {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(
        (p: Product) => p.category === this.selectedCategory
      );
    }
  }

  irACategoria(categoria: string): void {
    let filtro = categoria;
    if (categoria === 'destacados') {
      filtro = 'featured';
    }
    this.router.navigate(['/productos'], { queryParams: { categoria: filtro } });
  }

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
}
