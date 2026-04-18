import { Injectable, Inject } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { Observable, from, map } from 'rxjs';

export interface Bid {
  id?: string;
  productId: string;
  productName: string;
  userId: string;
  userEmail: string;
  userName: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({ providedIn: 'root' })
export class BidService {
  constructor(@Inject('FIRESTORE') private firestore: Firestore) {}

  createBid(bid: any): Promise<string> {
    const ahora = Timestamp.now();
    const bidsRef = collection(this.firestore, 'bids');
    return addDoc(bidsRef, {
      ...bid,
      status: 'pending',
      createdAt: ahora,
      updatedAt: ahora
    }).then((docRef) => docRef.id);
  }

  // ← AGREGAR ESTE MÉTODO
  getBidsByUser(userId: string): Observable<any[]> {
  const bidsRef = collection(this.firestore, 'bids');
  const q = query(bidsRef, where('userId', '==', userId));
  return from(getDocs(q)).pipe(
    map((snapshot) => {
      const bids = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      return bids.sort((a: any, b: any) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
    })
  );
}

  getBidsByProduct(productId: string): Observable<any[]> {
    const bidsRef = collection(this.firestore, 'bids');
    const q = query(bidsRef, where('productId', '==', productId), orderBy('amount', 'desc'));
    return from(getDocs(q)).pipe(
      map((snapshot) => snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    );
  }
}
