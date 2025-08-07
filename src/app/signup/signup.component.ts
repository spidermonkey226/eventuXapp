import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../class/user';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  user: User = new User(0, '', '', '', '', '', {
    id: 4, // Match DB ID for 'regularuser'
    permisionName: 'regularuser',
    role: 'ROLE_USER',
    name: 'Regular User'
  }, new Date());

  constructor(private userService: UserService) {}

  onSubmit(): void {
    this.user.date = new Date();
    this.userService.createUser(this.user).subscribe((res: any) => {
      alert(res);
      if (res === 'Registration successful!') {
        this.user = new User(0, '', '', '', '', '', {
          id: 4,
          permisionName: 'regularuser',
          role: 'ROLE_USER',
          name: 'Regular User'
        }, new Date());
      }
    });
  }
}

