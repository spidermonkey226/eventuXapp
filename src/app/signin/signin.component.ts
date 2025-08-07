import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-signin',
  imports: [CommonModule,RouterModule,FormsModule],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css'
})
export class SigninComponent {
  email: string = '';
  password: string = '';
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    this.successMessage = '';
    this.errorMessage = '';

    const credentials = {
      email: this.email,
      password: this.password
    };

    this.http.post<any>('http://localhost:8080/api/auth/signin', credentials)
      .subscribe({
        next: (response) => {
          console.log('Login success:', response);
          localStorage.setItem('token', response.token);
          localStorage.setItem('userId', response.id);
          this.successMessage = 'Sign in successful! Redirecting...';

          setTimeout(() => {
            this.router.navigate(['/']); // 👈 go to home page
          }, 1500);
        },
        error: (err) => {
          console.error("Login error:", err);
          if (err.status === 401) {
            this.errorMessage = err.error;
          } else {
            this.errorMessage = 'Something went wrong. Please try again.';
          }
        }
      });
  }
}
