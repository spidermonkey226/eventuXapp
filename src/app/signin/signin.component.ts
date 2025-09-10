import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css'
})
export class SigninComponent {
  email = '';
  password = '';
  successMessage = '';
  errorMessage = '';
  

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.successMessage = '';
    this.errorMessage = '';
    this.auth.login(this.email, this.password).subscribe(user => {
      if (user) {
        this.router.navigateByUrl('/'); // changes header immediately via observable
      } else {
        this.errorMessage = 'Invalid email or password.';
      }
    }, () => this.errorMessage = 'Something went wrong. Please try again.');
  }
}
