// src/app/add-event/add-event.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { EventService, AddEventPayload } from '../services/event.service';

@Component({
  selector: 'app-add-event',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-event.component.html',
  styleUrl: './add-event.component.css'
})
export class AddEventComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private events = inject(EventService);

  // These values must match your backend enums exactly
  categories = ['CONFERENCE', 'WORKSHOP', 'WEBINAR', 'SEMINAR', 'FESTIVAL']; // EventCategory
  cities = ['TEL AVIV', 'JERUSALEM', 'HAIFA']; // City

  submitted = false;
  submitting = false;
  topError = '';
  successMsg = '';
  // min selectable date (today)
  minDate = new Date().toISOString().slice(0, 10);

  form: AddEventPayload = {
    eventName: '',
    email: '',
    phone: '',

    date: '',
    people: 0,
    eventCategory: '',

    streetName: '',
    streetNumber: '',
    postCode: '',
    city: '',

    comments: '',

    hasManager: false,
    managerName: '',
    managerEmail: '',
    managerPhone: ''
  };
  emailPattern = '^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$';  // simple: has @ and a dot before end
  phonePattern = '^\\d{10}$';                          // exactly 10 digits
  ngOnInit(): void {
  this.auth.isLoggedIn$.subscribe(isIn => {
    if (!isIn) {
      alert('You must sign in to add an event.');
      this.router.navigate(['/signin'], { queryParams: { redirect: '/addevent' } });
    }
  });

  this.auth.user$.subscribe(u => {
    if (!u) return;
    this.form.email = u.email ?? '';
    this.form.phone = u.phone ?? '';
    if (this.form.hasManager) this.copyHostToManager();
  });
}

  onHasManagerToggle() {
    if (this.form.hasManager) {
      this.copyHostToManager();
    } else {
      this.form.managerName = '';
      this.form.managerEmail = '';
      this.form.managerPhone = '';
    }
  }

  private copyHostToManager() {
    // Optional: if you want a default name, combine first/last when available
    // this.form.managerName = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
    this.form.managerEmail = this.form.email;
    this.form.managerPhone = this.form.phone;
  }

  submit(f: NgForm) {
    this.submitted = true;
    this.topError = '';
    this.successMsg = '';
    // custom checks (in addition to template validators)
    if (this.form.date && this.form.date < this.minDate) {
      this.topError = 'Event date cannot be in the past.';
      return;
    }
    if (!this.form.people || this.form.people <= 0) {
      this.topError = 'Number of people must be at least 1.';
      return;
    }
    if (this.form.hasManager) {
      // ensure manager fields pass basic patterns
      if (!new RegExp(this.emailPattern).test(this.form.managerEmail || '')) {
        this.topError = 'Manager email is invalid.';
        return;
      }
      if (!new RegExp(this.phonePattern).test(this.form.managerPhone || '')) {
        this.topError = 'Manager phone must be exactly 10 digits.';
        return;
      }
    }

    if (f.invalid) return;

    if (this.submitting || !f.valid) return;
    this.submitting = true;

    // Minimal client checks
    if (!this.form.eventCategory) { alert('Please choose an event category.'); this.submitting = false; return; }
    if (!this.form.city) { alert('Please choose a city.'); this.submitting = false; return; }

    this.submitting = true;
    this.events.create(this.form).subscribe({
      next: () => {
        this.successMsg = 'Event created successfully!';
        this.submitting = false;
        this.router.navigateByUrl('/user-events'); // uncomment if you want redirect

        this.auth.refreshUser().subscribe({
          next: () => this.router.navigateByUrl('/user-events'),
          error: () => this.router.navigateByUrl('/user-events') // still navigate if refresh fails
        });
      },
      error: (err) => {
        this.submitting = false;
        const msg: string =
          err?.error?.message ||
          (typeof err?.error === 'string' ? err.error : '') ||
          err?.message ||
          'Failed to create event';

        if (msg.toLowerCase().includes('manager not found')) {
          this.topError = 'The event manager is not signed up yet. Please ask them to register.';
        } else if (msg.toLowerCase().includes('host user not found')) {
          this.topError = 'Your account was not recognized—please sign in again.';
          this.router.navigate(['/signin'], { queryParams: { redirect: '/addevent' }});
        } else {
          this.topError = msg;
        }
      }
    });
  }
}
