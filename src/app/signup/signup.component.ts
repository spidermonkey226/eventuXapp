import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  // Keep a simple form model; backend assigns ROLE_USER
  form = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: ''
  };

  submitting = false;

  constructor(private userService: UserService, private router: Router) {}

  onSubmit(): void {
    if (this.submitting) return;
    this.submitting = true;

    // POST /api/auth/signup — backend hashes password & sets ROLE_USER
    this.userService.createUser(this.form).subscribe({
    next: (res) => {
      alert(res?.message || 'Registration successful!');
      this.router.navigateByUrl('/'); // go home
    },
    error: (err) => {
      console.error(err);
      alert(err?.error?.message || err?.error || 'Registration failed');
      this.submitting = false;
    }
  });
  }
}
