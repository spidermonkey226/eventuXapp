import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
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
  form = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: ''
  };

  // patterns (kept in TS for readability)
  namePattern = '^[A-Z][a-z]*$';                       // Uppercase start, only letters
  emailPattern = '^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$';  // simple: has @ and a dot before end
  phonePattern = '^\\d{10}$';                          // exactly 10 digits
  passwordPattern = '^(?=.*[A-Z])(?=.*\\d).{8,}$';     // >=8, one uppercase, one digit

  submitting = false;

  constructor(private userService: UserService, private router: Router) {}

  onSubmit(ngForm: NgForm): void {
    if (this.submitting || !ngForm.valid) return;
    this.submitting = true;

    this.userService.createUser(this.form).subscribe({
      next: (res) => {
        alert(res?.message || 'Registration successful!');
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        alert(err?.error?.message || 'Registration failed');
        this.submitting = false;
      }
    });
  }
}
