export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  rol: 'user' | 'admin';
}
