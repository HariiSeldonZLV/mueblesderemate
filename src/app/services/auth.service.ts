// src/app/services/auth.service.ts
import { Injectable, Inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  Auth,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';
import { Firestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { Observable, from } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    @Inject('AUTH') private auth: Auth,
    @Inject('FIRESTORE') private firestore: Firestore,
    private router: Router
  ) {}

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  isAuthenticated(): boolean {
    return this.auth.currentUser !== null;
  }

  registerWithEmail(email: string, password: string, displayName: string): Observable<User> {
    return from(createUserWithEmailAndPassword(this.auth, email, password).then(async (userCredential) => {
      await this.saveUserToFirestore(userCredential.user, displayName);
      return userCredential.user;
    }));
  }

  loginWithEmail(email: string, password: string): Observable<User> {
    return from(signInWithEmailAndPassword(this.auth, email, password).then((userCredential) => userCredential.user));
  }

  loginWithGoogle(): Observable<User> {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.auth, provider).then(async (result) => {
      await this.saveUserToFirestore(result.user, result.user.displayName || '');
      return result.user;
    }));
  }

  loginWithFacebook(): Observable<User> {
    const provider = new FacebookAuthProvider();
    return from(signInWithPopup(this.auth, provider).then(async (result) => {
      await this.saveUserToFirestore(result.user, result.user.displayName || '');
      return result.user;
    }));
  }

  private async saveUserToFirestore(user: User, displayName: string) {
    const userRef = doc(this.firestore, `users/${user.uid}`);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        photoURL: user.photoURL || '',
        createdAt: new Date(),
        rol: 'user'
      });
    }
  }

  logout(): Observable<void> {
    return from(signOut(this.auth).then(() => {
      this.router.navigate(['/']);
    }));
  }
}
