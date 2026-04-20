import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  private adminService = inject(AdminService);
  private authService = inject(AuthService);

  activeTab: 'products' | 'bids' = 'products';
  loading = false;

  products: any[] = [];
  showProductForm = false;
  editingProduct: any = null;
  productForm = {
    name: '',
    description: '',
    price: 0,
    category: 'muebles',
    stock: 0,
    image: '',
    featured: false
  };

  bids: any[] = [];

  // Getters para filtrar ofertas (necesarios para la vista)
  get pendingBids() {
    return this.bids.filter(bid => bid.status === 'pending');
  }

  get acceptedBids() {
    return this.bids.filter(bid => bid.status === 'accepted');
  }

  get rejectedBids() {
    return this.bids.filter(bid => bid.status === 'rejected');
  }

  get pendingBidsCount() {
    return this.pendingBids.length;
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user?.email !== 'admin@rematezone.cl') {
      alert('Acceso denegado. Solo administradores.');
      return;
    }
    this.loadProducts();
    this.loadBids();
  }

  loadProducts() {
    this.loading = true;
    this.adminService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  openCreateProduct() {
    this.editingProduct = null;
    this.productForm = {
      name: '',
      description: '',
      price: 0,
      category: 'muebles',
      stock: 0,
      image: '',
      featured: false
    };
    this.showProductForm = true;
  }

  editProduct(product: any) {
    this.editingProduct = product;
    this.productForm = {
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      image: product.images?.[0] || '',
      featured: product.featured || false
    };
    this.showProductForm = true;
  }

  saveProduct() {
    const productData = {
      name: this.productForm.name,
      description: this.productForm.description,
      price: this.productForm.price,
      category: this.productForm.category,
      stock: this.productForm.stock,
      images: [this.productForm.image],
      featured: this.productForm.featured,
      createdAt: new Date()
    };

    if (this.editingProduct) {
      this.adminService.updateProduct(this.editingProduct.id, productData).then(() => {
        this.loadProducts();
        this.showProductForm = false;
        alert('Producto actualizado');
      });
    } else {
      this.adminService.createProduct(productData).then(() => {
        this.loadProducts();
        this.showProductForm = false;
        alert('Producto creado');
      });
    }
  }

  deleteProduct(id: string) {
    if (confirm('¿Eliminar este producto?')) {
      this.adminService.deleteProduct(id).then(() => {
        this.loadProducts();
        alert('Producto eliminado');
      });
    }
  }

  loadBids() {
    this.loading = true;
    this.adminService.getBids().subscribe({
      next: (bids) => {
        this.bids = bids;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  updateBidStatus(bidId: string, status: string) {
    this.adminService.updateBidStatus(bidId, status).then(() => {
      this.loadBids();
      alert(`Puja ${status === 'accepted' ? 'aceptada' : 'rechazada'}`);
    });
  }
}
