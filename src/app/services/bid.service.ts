import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, query, where, getDocs, orderBy, doc, updateDoc, Timestamp } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable, from } from 'rxjs';

export interface Bid {
  id?: string;
  productId: string;
  productName: string;
  userId: string;
  userEmail: string;
  userName?: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

@Injectable({ providedIn: 'root' })
export class BidService {
  constructor(
    private firestore: Firestore,
    private auth: Auth
  ) {}

  async createBid(bid: Omit<Bid, 'id' | 'createdAt' | 'status'>): Promise<string> {
    const newBid = {
      ...bid,
      status: 'pending' as const,
      createdAt: new Date()
    };

    const docRef = await addDoc(collection(this.firestore, 'bids'), newBid);
    return docRef.id;
  }

  getBidsByUser(userId: string): Observable<Bid[]> {
    return from(this.getUserBids(userId));
  }

  private async getUserBids(userId: string): Promise<Bid[]> {
    const q = query(
      collection(this.firestore, 'bids'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const bids = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    } as Bid));

    return bids;
  }

  async updateBidStatus(bidId: string, status: 'accepted' | 'rejected'): Promise<void> {
    const bidRef = doc(this.firestore, 'bids', bidId);
    await updateDoc(bidRef, { status });
  }
}
