import { Injectable, Inject } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore';
import { Observable, from, map } from 'rxjs';

export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  featured: boolean;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(@Inject('FIRESTORE') private firestore: Firestore) {}

  getProducts(): Observable<Product[]> {
    const productsRef = collection(this.firestore, 'products');
    const q = query(productsRef, orderBy('createdAt', 'desc'));
    return from(getDocs(q)).pipe(
      map((snapshot) => snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product)))
    );
  }

  createProduct(product: Omit<Product, 'id'>): Promise<string> {
    const productsRef = collection(this.firestore, 'products');
    return addDoc(productsRef, { ...product, createdAt: new Date() }).then((doc) => doc.id);
  }

  updateProduct(id: string, data: Partial<Product>): Promise<void> {
    const productRef = doc(this.firestore, `products/${id}`);
    return updateDoc(productRef, { ...data, updatedAt: new Date() });
  }

  deleteProduct(id: string): Promise<void> {
    const productRef = doc(this.firestore, `products/${id}`);
    return deleteDoc(productRef);
  }

  getBids(): Observable<any[]> {
    const bidsRef = collection(this.firestore, 'bids');
    const q = query(bidsRef, orderBy('createdAt', 'desc'));
    return from(getDocs(q)).pipe(
      map((snapshot) => snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    );
  }

  updateBidStatus(bidId: string, status: string): Promise<void> {
    const bidRef = doc(this.firestore, `bids/${bidId}`);
    return updateDoc(bidRef, { status, updatedAt: new Date() });
  }
}
