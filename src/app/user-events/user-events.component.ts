import { Component ,OnDestroy,OnInit,inject} from '@angular/core';
import { CommonModule,DatePipe,NgIf,NgFor } from '@angular/common';
import { Router,RouterModule  } from '@angular/router';
import { EventService ,EventItem} from '../services/event.service';
import { AuthService } from '../services/auth.service';
import { Subscription,combineLatest,map } from 'rxjs';
import { switchMap } from 'rxjs';
import { User } from '../class/user';
@Component({
  selector: 'app-user-events',
  standalone: true,
  imports: [CommonModule,RouterModule,NgIf,NgFor,DatePipe],
  templateUrl: './user-events.component.html',
  styleUrl: './user-events.component.css'
})
export class UserEventsComponent implements OnInit, OnDestroy {
  private events = inject(EventService);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = true;
  error = '';
  mineAsCreator: EventItem[] = [];
  mineAsManager: EventItem[] = [];

  private sub?: Subscription;
  myId!: number;
  ngOnInit(): void {
  this.sub = this.auth.user$
    .pipe(
      switchMap(user => {
        if (!user) throw new Error('Not signed in');
        // save my id once (supports idUser)
        this.myId = (user as any).id ?? (user as any).idUser;

        // fetch only my events
        return this.events.getMine().pipe(
          map(list => ({ list })) // <-- wrap so next operator can destructure
        );
      }),
      map(({ list }) => {
        // normalize keys just in case (id vs idUser, eventID vs id vs eventId)
        const normalized = (list as any[]).map(e => {
          const host = e.host ? { ...e.host, id: e.host.id ?? e.host.idUser } : undefined;
          const manager = e.manager ? { ...e.manager, id: e.manager.id ?? e.manager.idUser } : undefined;

          return {
            ...e,
            eventID: e.eventID ?? e.id ?? e.eventId,
            eventDate: e.eventDate ?? e.date,
            host,
            manager,
          } as EventItem;
        });

        const asCreator = normalized
          .filter(ev => ev.host?.id === this.myId)
          .sort((a, b) => (a.eventDate > b.eventDate ? 1 : -1));

        const asManager = normalized
          .filter(ev => ev.manager?.id === this.myId && ev.host?.id !== this.myId)
          .sort((a, b) => (a.eventDate > b.eventDate ? 1 : -1));

        return { asCreator, asManager };
      })
    )
    .subscribe({
      next: ({ asCreator, asManager }) => {
        this.mineAsCreator = asCreator;
        this.mineAsManager = asManager;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message || 'Failed to load events';
        this.loading = false;
      }
    });
}


  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

openEvent(ev: EventItem) {
  const id = ev.eventID;
  if (id == null) {
    this.error = 'Could not open this event (missing id).';
    return;
  }
  const isOwner = ev.host?.id === this.myId;
  const isManager = ev.manager?.id === this.myId;

  const route = isOwner ? ['/event-owner', id]
             : isManager ? ['/event-manager', id]
             : null;

  if (!route) {
    this.error = 'You are not associated with this event.';
    return;
  }
  this.router.navigate(route);
}

  fullName(u?: { firstName?: string; lastName?: string }): string {
    return u ? [u.firstName, u.lastName].filter(Boolean).join(' ') : '';
  }
}
