import { Component, inject, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { PujaModalComponent } from '../puja-modal/puja-modal.component';
import { AuthService } from '../../services/auth.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

declare var FB: any;

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, PujaModalComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit, AfterViewInit {
  authService = inject(AuthService);
  private productService = inject(ProductService);
  private router = inject(Router);

  productosRecientes: Product[] = [];
  loading = true;
  mostrarModal = false;
  productoSeleccionado: any = null;

  facebookPageUrl = 'https://facebook.com/profile.php?id=61572127465917'; // Cambia por tu URL

  ngOnInit(): void {
    this.cargarProductosRecientes();
    this.cargarFacebookSDK();
  }

  ngAfterViewInit(): void {
    // Esperar a que el DOM esté completamente renderizado
    setTimeout(() => {
      this.inicializarFacebookPlugin();
    }, 1500);
  }

  cargarFacebookSDK(): void {
    // Verificar si ya existe el SDK
    if (document.getElementById('facebook-jssdk')) {
      return;
    }

    // Cargar el SDK de Facebook
    (function(d, s, id) {
      const element = d.getElementsByTagName(s)[0];
      const js = d.createElement(s) as any;
      js.id = id;
      js.src = "https://connect.facebook.net/es_LA/sdk.js#xfbml=1&version=v18.0&appId=YOUR_APP_ID";

      if (element && element.parentNode) {
        element.parentNode.insertBefore(js, element);
      } else {
        d.head.appendChild(js);
      }
    }(document, 'script', 'facebook-jssdk'));
  }

  inicializarFacebookPlugin(): void {
    try {
      if (typeof FB !== 'undefined') {
        // Parsear solo si existe el elemento
        const fbPageElement = document.querySelector('.fb-page');
        if (fbPageElement) {
          FB.XFBML.parse();
          console.log('Plugin de Facebook inicializado');
        }
      }
    } catch (error) {
      console.warn('Error al inicializar Facebook plugin:', error);
    }
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
