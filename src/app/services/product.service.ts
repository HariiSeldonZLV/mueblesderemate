import { Injectable, Inject } from '@angular/core';
import { Firestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { Observable, from, map, of } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private productsCache: Product[] | null = null;
  private cacheTime: number | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  constructor(@Inject('FIRESTORE') private firestore: Firestore) {}

  getProducts(limitCount: number = 10): Observable<Product[]> {
    // Verificar caché
    if (this.productsCache && this.cacheTime && (Date.now() - this.cacheTime) < this.CACHE_DURATION) {
      console.log('Usando caché de productos');
      return of(this.productsCache.slice(0, limitCount));
    }

    console.log('Cargando productos desde Firebase');
    const productsRef = collection(this.firestore, 'products');
    const q = query(productsRef, orderBy('createdAt', 'desc'), limit(limitCount));
    return from(getDocs(q)).pipe(
      map(snapshot => {
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        this.productsCache = products;
        this.cacheTime = Date.now();
        return products;
      })
    );
  }
}
