import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { User } from '../class/user';
import { SubscriptionLevel } from '../class/user';

@Component({
  selector: 'app-profile',
    imports: [FormsModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  private users = inject(UserService);

  SubscriptionLevel = SubscriptionLevel;

  user: any | null = null;
  editMode = false;
  profileImageUrl: string | null = null;
  defaultImage = 'assets/default-profile.png';
  selectedFile: File | null = null; 

   readonly subLabels: Record<number, string> = {
    [SubscriptionLevel.Free]: 'Free',
    [SubscriptionLevel.Basic]: 'Basic',
    [SubscriptionLevel.Standard]: 'Standard',
    [SubscriptionLevel.Pro]: 'Pro',
    [SubscriptionLevel.Ultimate]: 'Ultimate'
  };

  // map enum -> max events
  readonly subMaxEvents: Record<number, number> = {
    [SubscriptionLevel.Free]: 5,
    [SubscriptionLevel.Basic]: 20,
    [SubscriptionLevel.Standard]: 50,
    [SubscriptionLevel.Pro]: 200,
    [SubscriptionLevel.Ultimate]: -1
  };

  // separate form model so we don't mutate `user` until Save
 formModel: any = {
    firstName: '', lastName: '', email: '', phone: '',
    newPassword: '', confirmPassword: ''
  };

  ngOnInit(): void {
    this.users.getMe().subscribe({
      next: (me) => {
        this.user = me;

        // ✅ also fetch avatar bytes (protected; uses interceptor)
        this.users.getMyAvatarBlob().subscribe({
          next: (blob) => {
            if (blob && blob.size > 0) {
              this.profileImageUrl = URL.createObjectURL(blob);
            } else {
              this.profileImageUrl = null;
            }
          },
          error: () => { this.profileImageUrl = null; }
        });
      },
      error: (err) => console.error('Unable to load profile', err)
    });
  }

  startEdit() {
    this.editMode = true;
    this.formModel = {
      firstName: this.user?.firstName ?? '',
      lastName:  this.user?.lastName ?? '',
      email:     this.user?.email ?? '',
      phone:     this.user?.phone ?? '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  cancel() {
    this.editMode = false;
    this.formModel.newPassword = '';
    this.formModel.confirmPassword = '';
    this.selectedFile = null; 
  }

  save() {
    if (!this.user) return;

    if (this.formModel.newPassword || this.formModel.confirmPassword) {
      if (this.formModel.newPassword !== this.formModel.confirmPassword) {
        alert('New password and confirmation do not match.');
        return;
      }
    }

    const id = this.user.idUser ?? this.user.id;
    const patch: any = {
      firstName: this.formModel.firstName,
      lastName:  this.formModel.lastName,
      email:     this.formModel.email,
      phone:     this.formModel.phone
    };
    if (this.formModel.newPassword) patch.password = this.formModel.newPassword;

    this.users.updateUser(id, patch).subscribe({
      next: () => {
        // 2) upload avatar if selected
        const upload$ = this.selectedFile ? this.users.uploadMyAvatar(this.selectedFile) : null;

        (upload$ ? upload$ : ({} as any)).subscribe?.({
          next: () => this.refreshAfterSave(),
          error: () => this.refreshAfterSave()
        }) || this.refreshAfterSave();
      },
      error: () => alert('Failed to update profile')
    });
  }

  private refreshAfterSave() {
    this.users.getMe().subscribe(me => this.user = me);
    this.users.getMyAvatarBlob().subscribe({
      next: (blob) => {
        if (blob && blob.size > 0) this.profileImageUrl = URL.createObjectURL(blob);
        else this.profileImageUrl = null;
      }
    });
    this.editMode = false;
    this.formModel.newPassword = this.formModel.confirmPassword = '';
    this.selectedFile = null;
    alert('Profile updated successfully');

  }


  onImageSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;
    this.selectedFile = file;                  // ✅ keep the file

    // local preview
    const reader = new FileReader();
    reader.onload = () => (this.profileImageUrl = reader.result as string);
    reader.readAsDataURL(file);
  }

  getSubscriptionName(level: number | undefined | null): string {
    if (level === undefined || level === null) return '-';
    return this.subLabels[level] ?? '-';
  }

  toDate(d: string | Date | null | undefined): Date | null {
    if (!d) return null;
    if (d instanceof Date) return d;
    // Backend sends LocalDate (no time) → make it a safe ISO Date
    return new Date(`${d}T00:00:00`);
  }

   getMaxEvents(level: number | undefined | null): string {
    if (level === undefined || level === null) return '-';
    const n = this.subMaxEvents[level];
    return n === -1 ? 'Unlimited' : String(n);
  }
}