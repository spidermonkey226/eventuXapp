import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { EventService, EventDetail } from '../services/event.service';

@Component({
  selector: 'app-invited-event',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './invited-event.component.html',
  styleUrl: './invited-event.component.css'
})
export class InvitedEventComponent implements OnInit {
  eventId!: number;
  event?: EventDetail;
  loading = true;
  error = '';

  constructor(private route: ActivatedRoute, private eventSvc: EventService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || Number.isNaN(id)) {
      this.error = 'Invalid event id';
      this.loading = false;
      return;
    }
    this.eventId = id;

    this.eventSvc.getById(id).subscribe({
      next: (ev) => { this.event = ev; this.loading = false; },
      error: (err) => { this.error = err?.error?.message || 'Failed to load event'; this.loading = false; }
    });
  }

  eventName(): string {
    return this.event?.eventName || 'Event';
  }
  eventDate(): string {
    return this.event?.eventDate || '';
  }

}
