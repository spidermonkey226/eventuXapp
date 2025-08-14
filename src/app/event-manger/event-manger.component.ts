import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, NgIf, NgFor } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { forkJoin, map, switchMap } from 'rxjs';
import { InvitedService ,InvitedDTO } from '../services/invited.service';
import { Invited } from '../class/invited';
import { EventService, EventDetail } from '../services/event.service';


type RSVP = 'COMING' | 'NOT_COMING' | 'NO_RESPONSE';


@Component({
  selector: 'app-event-manger',
  imports: [CommonModule],
  templateUrl: './event-manger.component.html',
  styleUrl: './event-manger.component.css'
})
export class EventManagerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private invitedService = inject(InvitedService);
  private eventService = inject(EventService);

  // UI state
  loading = true;
  error = '';

  // Event info
  eventId!: number;
  event?: EventDetail;

  // Guests + stats
  guests: InvitedDTO[] = [];

  totalGuests = 0;
  comingCount = 0;
  notComingCount = 0;
  noResponseCount = 0;

   ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map(params => Number(params.get('id'))),
        switchMap(id => {
          if (!id || Number.isNaN(id)) throw new Error('Invalid event id');
          this.eventId = id;
          return forkJoin({
            event: this.eventService.getById(id),
            guests: this.invitedService.getByEventId(id),
          });
        })
      )
      .subscribe({
        next: ({ event, guests }) => {
          this.event = event;
          this.guests = guests ?? [];
          this.computeStats();
          this.loading = false;
        },
        error: (err) => {
          this.error = err?.message || 'Failed to load event or guests';
          this.loading = false;
        }
      });
  }

  private computeStats(): void {
  const norm = (g: InvitedDTO): RSVP =>
    g.coming === true ? 'COMING'
    : g.coming === false ? 'NOT_COMING'
    : 'NO_RESPONSE';

  this.totalGuests = this.guests.length;
  this.comingCount = this.guests.filter(g => norm(g) === 'COMING').length;
  this.notComingCount = this.guests.filter(g => norm(g) === 'NOT_COMING').length;
  this.noResponseCount = this.guests.filter(g => norm(g) === 'NO_RESPONSE').length;
}

  // helpers
   eventName(): string {
    return this.event?.eventName ?? (this as any).event?.name ?? 'Event';
  }
  eventCode(): number | undefined {
    return this.event?.eventID ?? this.event?.eventId ?? this.event?.id;
  }
  fullName(u?: { firstName?: string; lastName?: string }): string {
    return u ? [u.firstName, u.lastName].filter(Boolean).join(' ') : '';
  }
   guestEmail(g: InvitedDTO): string {
    return g?.email || '';
  }

  dateFmt(): string {
    return this.event?.eventDate || '';
  }
}