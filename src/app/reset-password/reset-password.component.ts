import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {
  token = '';
  password = '';
  confirm = '';
  loading = false;
  message = '';
  error = '';
  private api = 'http://localhost:8080/api/auth/reset-password'; // your Spring endpoint

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) this.error = 'Invalid or expired link.';
  }

  submit() {
    if (!this.token || this.password !== this.confirm || this.loading) return;

    this.loading = true; this.message = ''; this.error = '';
    this.http.post(this.api, { token: this.token, password: this.password }).subscribe({
      next: () => {
        this.message = 'Password updated. Redirecting to sign in…';
        this.loading = false;
        setTimeout(() => this.router.navigateByUrl('/signin'), 1200);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Could not reset password. The link may have expired.';
        this.loading = false;
      }
    });
  }
}
