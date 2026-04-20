import { Injectable, inject } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  User,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, from, Observable, of, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();
  private currentUser: User | null = null;
  private userRoleSubject = new BehaviorSubject<string | null>(null);
  userRole$ = this.userRoleSubject.asObservable();

  constructor() {
    onAuthStateChanged(this.auth, async (user) => {
      console.log('🔄 onAuthStateChanged - Usuario:', user?.email);
      this.currentUser = user;
      this.userSubject.next(user);

      if (user) {
        const role = await this.getUserRole(user.uid);
        console.log('📌 Rol obtenido para', user.email, ':', role);
        this.userRoleSubject.next(role);
      } else {
        this.userRoleSubject.next(null);
      }
    });
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  async loginWithEmail(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      this.currentUser = userCredential.user;
      console.log('✅ Login exitoso:', email);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  }

  async registerWithEmail(email: string, password: string, displayName: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(this.firestore, 'users', user.uid), {
        email: user.email,
        displayName: displayName,
        createdAt: new Date(),
        uid: user.uid,
        rol: 'user'
      });

      this.currentUser = user;
      return user;
    } catch (error) {
      throw error;
    }
  }

  async loginWithGoogle(): Promise<User> {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(this.auth, provider);
      const user = result.user;

      const userDoc = await getDoc(doc(this.firestore, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(this.firestore, 'users', user.uid), {
          email: user.email,
          displayName: user.displayName,
          createdAt: new Date(),
          uid: user.uid,
          rol: 'user'
        });
      } else {
        console.log('📄 Documento encontrado en Firestore:', userDoc.data());
      }

      this.currentUser = user;

      const role = await this.getUserRole(user.uid);
      console.log('🎯 Rol después de login con Google:', role);
      this.userRoleSubject.next(role);

      return user;
    } catch (error) {
      throw error;
    }
  }

  async loginWithFacebook(): Promise<User> {
    const provider = new FacebookAuthProvider();
    try {
      const result = await signInWithPopup(this.auth, provider);
      const user = result.user;

      const userDoc = await getDoc(doc(this.firestore, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(this.firestore, 'users', user.uid), {
          email: user.email,
          displayName: user.displayName,
          createdAt: new Date(),
          uid: user.uid,
          rol: 'user'
        });
      }

      this.currentUser = user;
      return user;
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.currentUser = null;
    this.userRoleSubject.next(null);
    this.router.navigate(['/login']);
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error) {
      throw error;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  async getUserRole(uid: string): Promise<string> {
    try {
      console.log('🔍 Buscando rol para UID:', uid);
      const userDoc = await getDoc(doc(this.firestore, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        console.log('📋 Datos del documento:', data);
        const role = data['rol'] || data['role'] || 'user';
        console.log('👑 Rol encontrado:', role);
        return role;
      } else {
        console.warn('⚠️ No existe documento para UID:', uid);
        return 'user';
      }
    } catch (error) {
      console.error('Error obteniendo rol:', error);
      return 'user';
    }
  }

  async isAdmin(): Promise<boolean> {
    if (!this.currentUser) return false;
    const role = await this.getUserRole(this.currentUser.uid);
    console.log('🔐 Verificando isAdmin:', role === 'admin');
    return role === 'admin';
  }

  isAdmin$(): Observable<boolean> {
    return this.userRole$.pipe(
      switchMap(role => {
        console.log('📡 isAdmin$ - rol actual:', role);
        return of(role === 'admin');
      })
    );
  }

  getCurrentRole(): string | null {
    return this.userRoleSubject.value;
  }
}
