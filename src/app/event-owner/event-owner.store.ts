// event-owner.store.ts
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { EventService, EventDetail } from '../services/event.service';
import { InvitedService, InvitedDTO, InviteCreateRequest } from '../services/invited.service';

export interface EditableInvited {
  id: { eventId: number; email: string };
  firstName: string;
  note?: string;
  coming?: boolean | null;
  _editing?: boolean;
  _selected?: boolean;
  _draftFirstName?: string;
  _draftNote?: string;
}

@Injectable({ providedIn: 'root' })
export class EventOwnerStore {
  private eventService = inject(EventService);
  private invitedService = inject(InvitedService);

  eventId!: number;

  // state
  event$  = new BehaviorSubject<EventDetail | undefined>(undefined);
  guests$ = new BehaviorSubject<EditableInvited[]>([]);
  files$  = new BehaviorSubject<{ id?: number; name?: string }[]>([]);
  loading$= new BehaviorSubject<boolean>(true);
  error$  = new BehaviorSubject<string>('');

  // derived stats
  stats$ = this.guests$.pipe(
    map(gs => {
      const total = gs.length;
      const coming = gs.filter(g => g.coming === true).length;
      const notComing = gs.filter(g => g.coming === false).length;
      const noResp = gs.filter(g => g.coming == null).length;
      return { total, coming, notComing, noResp };
    })
  );

  bootstrap(id: number) {
    this.eventId = id;
    this.loading$.next(true);
    this.error$.next('');
    forkJoin({
      event: this.eventService.getById(id),
      guests: this.invitedService.getByEventId(id),
      files: this.eventService.getFiles(id)
    }).subscribe({
      next: ({ event, guests, files }) => {
        this.event$.next(event);
        this.guests$.next((guests ?? []).map(g => this.toRow(g)));
        this.files$.next(files ?? []);
        this.loading$.next(false);
      },
      error: (err) => {
        this.error$.next(err?.error?.message || err?.message || 'Failed to load event');
        this.loading$.next(false);
      }
    });
  }

  // ---- guests api (moved from your component) ----
  createInvite(req: InviteCreateRequest) {
    return this.invitedService.create(req).pipe(
      map(created => {
        const next = [this.toRow(created), ...this.guests$.value];
        this.guests$.next(next);
        return created;
      })
    );
  }
  updateInvite(email: string, data: { firstName?: string; note?: string }) {
    return this.invitedService.update({ eventId: this.eventId, email, ...data }).pipe(
      map(saved => {
        const copy = this.guests$.value.map(g => {
          if (g.id.email !== email) return g;
          return {
            ...g,
            firstName: (saved.firstName ?? data.firstName) ?? g.firstName,
            note: saved.note == null ? data.note : saved.note,
          };
        });
        this.guests$.next(copy);
        return saved;
      })
    );
  }
  deleteInvite(email: string) {
    return this.invitedService.delete(this.eventId, email).pipe(
      map(() => {
        this.guests$.next(this.guests$.value.filter(g => g.id.email !== email));
      })
    );
  }
  deleteInvites(emails: string[]) {
    return forkJoin(emails.map(e => this.invitedService.delete(this.eventId, e))).pipe(
      map(() => {
        const set = new Set(emails);
        this.guests$.next(this.guests$.value.filter(g => !set.has(g.id.email)));
      })
    );
  }
  resendInvite(email: string) {
  return this.invitedService.resend(this.eventId, email);
}

  // ---- files api (moved) ----
  upload(files: File[]) {
    return this.eventService.uploadFiles(this.eventId, files).pipe(
      map(list => {
        this.files$.next(list ?? []);
        return list;
      })
    );
  }
  deleteFile(fileId: number) {
    return this.eventService.deleteFile(this.eventId, fileId).pipe(
      map(() => {
        this.files$.next(this.files$.value.filter(f => f.id !== fileId));
      })
    );
  }

  // ---- helpers ----
  private toRow(g: InvitedDTO | any): EditableInvited {
    return {
      id: { eventId: g.eventId ?? g.id?.eventId, email: g.email ?? g.id?.email },
      firstName: g.firstName ?? '',
      note: g.note ?? undefined,
      coming: this.normalizeComing(g.coming),
      _editing: false,
      _selected: false
    };
  }
  private normalizeComing(raw: any): boolean | null {
    if (raw == null) return null;
    if (raw === true || raw === false) return raw;
    if (raw === 1 || raw === 0) return !!raw;
    if (raw === '1' || raw === '0') return raw === '1';
    if (raw === 'true' || raw === 'false') return raw === 'true';
    if (typeof raw === 'object' && raw !== null && 'length' in raw && (raw as any).length === 1) {
      const byte = (raw as any)[0]; if (byte === 0 || byte === 1) return !!byte;
    }
    try { return !!raw; } catch { return null; }
  }
}
