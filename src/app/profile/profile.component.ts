import { Component, OnInit } from '@angular/core';
import { User } from '../class/user';
import { UserService } from '../services/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-profile',
    imports: [FormsModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  profileImageUrl: string | null = null;
  defaultImage = 'assets/default-profile.png';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    console.log('✅ ProfileComponent loaded');
    
    const userId = Number(localStorage.getItem('userId'));
    console.log('User ID:', userId);

    if (!userId || isNaN(userId)) {
      console.warn('No user ID found in localStorage.');
      return;
    }

    this.userService.getUserById(userId).subscribe({
      next: (data) => {
        console.log('User data received:', data);
        this.user = data;
      },
      error: (err) => {
        console.error('Error loading user:', err);
      }
    });
  }

  updateUser(): void {
    if (!this.user) return;

    this.userService.updateUser(this.user.idUser, this.user).subscribe({
      next: () => alert('Profile updated successfully'),
      error: () => alert('Failed to update profile')
    });
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => (this.profileImageUrl = reader.result as string);
      reader.readAsDataURL(file);
    }
  }
}
