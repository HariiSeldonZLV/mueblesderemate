import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BidService } from '../../services/bid.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss'
})
export class PerfilComponent implements OnInit {
  private authService = inject(AuthService);
  private bidService = inject(BidService);

  user = this.authService.getCurrentUser();
  pujas: any[] = [];
  loading = true;

  ngOnInit(): void {
    if (this.user) {
      this.bidService.getBidsByUser(this.user.uid).subscribe({
        next: (pujas: any[]) => {
          this.pujas = pujas;
          this.loading = false;
        },
        error: (err: any) => {
          console.error('Error cargando pujas:', err);
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }
}