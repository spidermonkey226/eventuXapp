import { Component,OnInit  } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router'; // ✅ CORRECT
import { jwtDecode } from 'jwt-decode'; // ✅ Correct


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule,CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  isLoggedIn: boolean = false;
  userEmail: string | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.checkLogin();
    const token = localStorage.getItem('token');
    if (token) {
      this.isLoggedIn = true;

      try {
         const decoded: any = jwtDecode(token);
        this.userEmail = decoded.sub; // sub = email in your JWT
      } catch (error) {
        console.error("Invalid token");
        this.isLoggedIn = false;
      }
    }
  }
  checkLogin(): void {
  const token = localStorage.getItem('token');
  this.isLoggedIn = !!token;
}
  logout(): void {
    localStorage.removeItem('token');
    this.isLoggedIn = false;
    this.userEmail = null;
    this.router.navigate(['/']);
  }
}