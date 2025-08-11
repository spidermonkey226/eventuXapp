import { Component,inject   } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router'; 
import { AuthService } from '../services/auth.service';



@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule,CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  isLoggedIn$ = this.auth.isLoggedIn$; // safe now
  user$ = this.auth.user$;

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}