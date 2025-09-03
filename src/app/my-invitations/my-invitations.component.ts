import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, finalize } from 'rxjs/operators';

import { InvitedService, InvitedDTO } from '../services/invited.service';
import { EventService, EventDetail } from '../services/event.service';
import { UserService } from '../services/user.service';
import { FormsModule } from '@angular/forms';

type InvitationWithEvent = {
  invited: InvitedDTO;
  event: EventDetail;
};

@Component({
  selector: 'app-my-invitations',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './my-invitations.component.html',
  styleUrl: './my-invitations.component.css'
})
export class MyInvitationsComponent implements OnInit {
 email = '';
  loading = false;
  error: string | null = null;
  notLoggedIn = false;

  items: InvitationWithEvent[] = [];

  constructor(
    private invitedSvc: InvitedService,
    private eventSvc: EventService,
    private userSvc: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.userSvc.getMe().pipe(
      catchError(() => {
        // Not signed in (401, etc.)
        this.notLoggedIn = true;
        return of(null);
      }),
      switchMap(me => {
        if (!me?.email) {
          this.notLoggedIn = true;
          return of<InvitedDTO[]>([]);
        }
        this.notLoggedIn = false;
        this.email = (me.email as string).trim().toLowerCase();

        // get all invites, filter by current user's email
        return this.invitedSvc.getAll().pipe(
          map(list => list.filter(i => (i.email || '').toLowerCase() === this.email))
        );
      }),
      switchMap((invitedForEmail: InvitedDTO[]) => {
        if (this.notLoggedIn) return of({ invitedForEmail, events: [] as EventDetail[] });
        if (invitedForEmail.length === 0) return of({ invitedForEmail, events: [] as EventDetail[] });

        const uniqueIds = Array.from(new Set(invitedForEmail.map(i => i.eventId)));
        const calls = uniqueIds.map(id => this.eventSvc.getById(id));
        return forkJoin(calls).pipe(map(events => ({ invitedForEmail, events })));
      }),
      finalize(() => (this.loading = false))
    ).subscribe({
      next: ({ invitedForEmail, events }) => {
        if (this.notLoggedIn) return;
        const byEventId = new Map<number, InvitedDTO>();
        invitedForEmail.forEach(i => byEventId.set(i.eventId, i));

        this.items = events.map(ev => {
          const id = (ev.eventID ?? ev.eventId ?? ev.id) as number;
          return { invited: byEventId.get(id)!, event: ev };
        }).sort((a, b) => {
          const da = a.event.eventDate ? new Date(a.event.eventDate).getTime() : 0;
          const db = b.event.eventDate ? new Date(b.event.eventDate).getTime() : 0;
          return db - da;
        });
      },
      error: (err: any) => {
        this.error = err?.error?.message || 'Could not load invitations.';
      }
    });
  }

  openEvent(id?: number) {
    if (!id) return;
    this.router.navigate(['/invited-event', id]); // or '/events/:id' if that’s your details route
  }

  statusClass(v: InvitedDTO['coming']) {
    if (v === true) return 'status accepted';
    if (v === false) return 'status declined';
    return 'status pending';
  }
  statusLabel(v: InvitedDTO['coming']) {
    if (v === true) return 'accepted';
    if (v === false) return 'declined';
    return 'pending';
  }

  goSignIn() {
    this.router.navigate(['/signin'], { queryParams: { redirect: this.router.url } });
  }
}
