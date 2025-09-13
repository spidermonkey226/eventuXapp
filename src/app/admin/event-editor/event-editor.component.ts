import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms'; // ✅ for [(ngModel)]
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EventService, EventItem, EventDetail } from '../../services/event.service';

@Component({
  selector: 'app-event-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule], // ✅ added FormsModule
  templateUrl: './event-editor.component.html',
  styleUrls: ['./event-editor.component.css']
})
export class EventEditorComponent implements OnInit {
  events: EventItem[] = [];
  form!: FormGroup;
  isEditMode = false;
  eventId: number | null = null;
  loading = false;

  // 🔍 Search term for filtering
  searchTerm = '';

  categories = [
  { value: 'WEDDINGS', label: 'Weddings' },
  { value: 'BIRTHDAYS', label: 'Birthdays' },
  { value: 'ANNIVERSARIES', label: 'Anniversaries' },
  { value: 'BUSINESS_CONFERENCES', label: 'Business Conferences' },
  { value: 'MEETINGS', label: 'Meetings' },
  { value: 'FAMILY_GATHERINGS', label: 'Family Gatherings' }
];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.eventId = Number(idParam);
      this.setupForm();
      this.loadEvent(this.eventId);
    }
 else {
      this.isEditMode = false;
      this.loadEvents();
    }
  }

  // ---------- LIST MODE ----------
  loadEvents(): void {
    this.loading = true;
    this.eventService.getAll().subscribe({
      next: (data) => {
        this.events = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading events:', err);
        this.loading = false;
      }
    });
  }

  // ✅ Filtered events based on searchTerm
  get filteredEvents(): EventItem[] {
    if (!this.searchTerm.trim()) return this.events;
    const term = this.searchTerm.toLowerCase();
    return this.events.filter(e =>
      e.eventName.toLowerCase().includes(term) ||
      e.eventCatgory.toLowerCase().includes(term) ||
      (e.address?.city?.toLowerCase().includes(term) ?? false)
    );
  }

  editEvent(id: number): void {
    this.router.navigate(['/admin/events', id]);
  }

  deleteEvent(id: number): void {
    if (confirm('Are you sure you want to delete this event?')) {
      this.eventService.delete(id).subscribe({
        next: () => {
          console.log('Event deleted');
          this.loadEvents();
        },
        error: (err) => console.error('Error deleting event:', err)
      });
    }
  }

  // ---------- EDIT MODE ----------
  setupForm(): void {
    this.form = this.fb.group({
      eventName: ['', Validators.required],
      eventCatgory: ['', Validators.required],
      eventDate: ['', Validators.required],
      expectedPeople: [0, [Validators.required, Validators.min(1)]],

      comments: [''],
      address: this.fb.group({
        streetName: [''],
        streetNumber: [''],
        postCode: [''],
        city: ['']
      }),
      host: this.fb.group({
        email: ['']
      }),
      manager: this.fb.group({
        email: ['']
      })
    });
  }

  loadEvent(id: number): void {
  this.loading = true;
  this.eventService.getById(id).subscribe({
    next: (event: EventDetail) => {
      this.form.patchValue({
        eventName: event.eventName || '',
        eventCatgory: event.eventCatgory || '',
        eventDate: event.eventDate || '',
        expectedPeople: event.expectedPeople || 0,
        comments: event.comments || '',
        address: {
          streetName: event.address?.streetName || '',
          streetNumber: event.address?.streetNumber || '',
          postCode: event.address?.postCode || '',
          city: event.address?.city || ''
        },
        host: {
          email: event.host?.email || ''
        },
        manager: {
          email: event.manager?.email || ''
        }
      });

      console.log('Form patched:', this.form.value);
      console.log('Valid?', this.form.valid);
      this.loading = false;
    },
    error: (err) => {
      console.error('Error loading event:', err);
      this.loading = false;
    }
  });
}


save(): void {
  console.log('Save button clicked');  // 👈 check if it fires

  if (this.form.invalid || !this.eventId) {
    console.log('Form invalid or eventId missing', this.form.value, this.eventId);
    this.form.markAllAsTouched();
    return;
  }

  console.log('Form is valid, building payload...');
  const raw = this.form.value;

  const payload = {
    eventName: raw.eventName,
    eventCategory: raw.eventCatgory,
    date: raw.eventDate,
    people: raw.expectedPeople,
    comments: raw.comments,
    streetName: raw.address.streetName,
    streetNumber: raw.address.streetNumber,
    postCode: raw.address.postCode,
    city: raw.address.city,
    email: raw.host.email,
    hasManager: !!raw.manager?.email,
    managerEmail: raw.manager?.email || null
  };

  console.log('Payload:', payload);

  this.eventService.update(this.eventId!, payload).subscribe({
    next: () => {
      console.log('Event updated');
      this.router.navigate(['/admin/events']);
    },
    error: (err) => console.error('Error updating event:', err)
  });
}



  cancel(): void {
    this.router.navigate(['/admin/events']);
  }
}