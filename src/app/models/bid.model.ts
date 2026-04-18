export interface Bid {
  id?: string;
  productId: string;
  productName: string;
  userId: string;
  userEmail: string;
  userName: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}
