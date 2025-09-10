import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  // Removed templateUrl and fixed styleUrls
  styleUrls: ['./forgot-password.component.css'],
  template: `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f6f7f9;">
      <form (ngSubmit)="submit()" #f="ngForm"
            style="width:360px;background:#fff;padding:24px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.12)">
        <h2 style="margin:0 0 16px;text-align:center;">Forgot Password</h2>

        <p *ngIf="message" style="background:#d4edda;color:#155724;padding:8px;border-radius:6px;margin:0 0 10px;">
          {{ message }}
        </p>
        <p *ngIf="error" style="background:#f8d7da;color:#721c24;padding:8px;border-radius:6px;margin:0 0 10px;">
          {{ error }}
        </p>

        <label style="display:block;margin-bottom:6px;font-size:14px;">Email</label>
        <input type="email" name="email" [(ngModel)]="email" required
               style="width:100%;height:40px;padding:0 12px;border:1px solid #ddd;border-radius:8px;margin-bottom:12px" />

        <button type="submit" [disabled]="f.invalid || loading"
                style="width:100%;height:40px;border:0;border-radius:8px;background:#3b82f6;color:#fff;cursor:pointer">
          {{ loading ? 'Sending…' : 'Send reset link' }}
        </button>
      </form>
    </div>
  `
})
export class ForgotPasswordComponent {
  email = '';
  loading = false;
  message = '';
  error = '';

  // If you're using Angular dev proxy, keep it as '/api/...'
  // Otherwise, point to full backend URL like 'http://localhost:8080/api/auth/forgot-password'
private api = 'http://localhost:8080/api/auth/forgot-password';

  constructor(private http: HttpClient) {}

  submit() {
    if (!this.email || this.loading) return;
    this.loading = true; this.message = ''; this.error = '';

    this.http.post(this.api, { email: this.email }).subscribe({
      next: () => { this.message = 'If an account exists for that email, a reset link has been sent.'; this.loading = false; },
      error: () => { this.message = 'If an account exists for that email, a reset link has been sent.'; this.loading = false; }
    });
  }
}
