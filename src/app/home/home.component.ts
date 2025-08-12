import { Component,inject } from '@angular/core';
import { RouterModule} from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-home',
  imports: [RouterModule,CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
    private auth = inject(AuthService);
    private router = inject(Router);
  
    isLoggedIn$ = this.auth.isLoggedIn$; // safe now
    user$ = this.auth.user$;
  
}
