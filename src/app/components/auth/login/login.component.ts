import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  displayName = '';
  isLoginMode = true;
  loading = false;
  error = '';

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.error = '';
  }

  async onSubmit() {
    this.loading = true;
    this.error = '';

    try {
      if (this.isLoginMode) {
        await this.authService.loginWithEmail(this.email, this.password);
      } else {
        if (this.password.length < 6) {
          this.error = 'La contraseña debe tener al menos 6 caracteres';
          this.loading = false;
          return;
        }
        await this.authService.registerWithEmail(this.email, this.password, this.displayName);
      }
      this.router.navigate(['/']);
    } catch (err: any) {
      this.error = this.getErrorMessage(err.code);
    } finally {
      this.loading = false;
    }
  }

  async loginWithGoogle() {
    this.loading = true;
    try {
      await this.authService.loginWithGoogle();
      this.router.navigate(['/']);
    } catch (err: any) {
      this.error = this.getErrorMessage(err.code);
    } finally {
      this.loading = false;
    }
  }

  async loginWithFacebook() {
    this.loading = true;
    try {
      await this.authService.loginWithFacebook();
      this.router.navigate(['/']);
    } catch (err: any) {
      this.error = this.getErrorMessage(err.code);
    } finally {
      this.loading = false;
    }
  }

  private getErrorMessage(code: string): string {
    switch (code) {
      case 'auth/invalid-email': return 'Email inválido';
      case 'auth/user-disabled': return 'Usuario deshabilitado';
      case 'auth/user-not-found': return 'Usuario no encontrado';
      case 'auth/wrong-password': return 'Contraseña incorrecta';
      case 'auth/email-already-in-use': return 'Email ya registrado';
      case 'auth/weak-password': return 'Contraseña débil';
      default: return 'Error al autenticar. Intenta nuevamente.';
    }
  }
}
