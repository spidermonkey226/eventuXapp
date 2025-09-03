import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { EventService,EventDetail } from '../../services/event.service';

@Component({
  selector: 'app-invited-event-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invited-event-details.component.html',
  styleUrl: './invited-event-details.component.css'
})
export class InvitedEventDetailsComponent implements OnInit {
  eventId!: number;
  event?: EventDetail;
  loading = true;
  error = '';

  constructor(private route: ActivatedRoute, private eventSvc: EventService) {}

  ngOnInit(): void {
    this.eventId = Number(this.route.parent?.snapshot.paramMap.get('id') ?? this.route.snapshot.paramMap.get('id'));
    if (!this.eventId || Number.isNaN(this.eventId)) { this.error = 'Invalid event id'; this.loading = false; return; }

    this.eventSvc.getById(this.eventId).subscribe({
      next: (ev) => { this.event = ev; this.loading = false; },
      error: (err) => { this.error = err?.error?.message || 'Failed to load event'; this.loading = false; }
    });
  }

}
