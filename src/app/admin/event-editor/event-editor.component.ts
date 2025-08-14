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
    'Weddings',
    'Birthdays',
    'Anniversaries',
    'Business Conferences',
    'Meetings',
    'Family Gatherings'
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
    } else {
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
        this.form.patchValue(event);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading event:', err);
        this.loading = false;
      }
    });
  }

  save(): void {
    if (this.form.invalid || !this.eventId) {
      this.form.markAllAsTouched();
      return;
    }
    this.eventService.update(this.eventId, this.form.value).subscribe({
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