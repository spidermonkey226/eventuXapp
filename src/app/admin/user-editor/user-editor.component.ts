import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { UserService } from '../../services/user.service';
import { User } from '../../class/user';
import { Permision } from '../../class/permision';

@Component({
  selector: 'app-user-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './user-editor.component.html',
  styleUrl: './user-editor.component.css'
})
export class UserEditorComponent implements OnInit {
  users: User[] = [];
  form!: FormGroup;
  isEditMode = false;
  userId: number | null = null;
  loading = false;

  // 🔍 Search term for filtering
  searchTerm = '';

  permissions = [
    { id: 1, label: 'Administrator' },
    { id: 2, label: 'Event Creator' },
    { id: 3, label: 'Event Manager' },
    { id: 4, label: 'Guest User' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.userId = Number(idParam);
      this.setupForm();
      this.loadUser(this.userId);
    } else {
      this.isEditMode = false;
      this.loadUsers();
    }
  }

  // ----------- LIST MODE -----------
  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.loading = false;
      }
    });
  }

  // ✅ Filtered users based on searchTerm
  get filteredUsers(): User[] {
    if (!this.searchTerm.trim()) return this.users;
    const term = this.searchTerm.toLowerCase();
    return this.users.filter(u =>
      u.firstName.toLowerCase().includes(term) ||
      u.lastName.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    );
  }

  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          console.log('User deleted');
          this.loadUsers();
        },
        error: (err) => console.error('Error deleting user:', err)
      });
    }
  }

  editUser(id: number): void {
    this.router.navigate(['/admin/users', id]);
  }

  // ----------- EDIT MODE -----------
  setupForm(): void {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: [''], // optional, only if changing password
      permission: [null, Validators.required]
    });
  }

  loadUser(id: number): void {
    this.loading = true;
    this.userService.getUserById(id).subscribe({
      next: (user: User) => {
        this.form.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          permission: user.permission
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading user:', err);
        this.loading = false;
      }
    });
  }

  save(): void {
    if (this.form.invalid || !this.userId) {
      this.form.markAllAsTouched();
      return;
    }

    this.userService.updateUser(this.userId, this.form.value).subscribe({
      next: () => {
        console.log('User updated');
        this.router.navigate(['/admin/users']);
      },
      error: (err) => console.error('Error updating user:', err)
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/users']);
  }
}
