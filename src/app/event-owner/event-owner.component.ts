import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, map, switchMap } from 'rxjs';
import { EventService, EventDetail } from '../services/event.service';
import { InvitedService,InvitedDTO,InviteCreateRequest } from '../services/invited.service';

// What the backend returns/accepts for invites on this page


// Row model used by the table
interface EditableInvited {
  id: { eventId: number; email: string };
  firstName: string;
  note?: string;
  coming?: boolean | null;

  _editing?: boolean;
  _selected?: boolean;
  _draftFirstName?: string;
  _draftNote?: string;
}

@Component({
  selector: 'app-event-owner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-owner.component.html',
  styleUrl: './event-owner.component.css'
})
export class EventOwnerComponent implements OnInit {
  // DI
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private invitedService = inject(InvitedService);

  // UI state
  loading = true;
  error = '';
  saving = false;

  // Event
  eventId!: number;
  event?: EventDetail;

  // Files
  files: { id?: number; name?: string }[] = [];
  uploading = false;

  // Guests + stats
  guests: EditableInvited[] = [];
  totalGuests = 0;
  comingCount = 0;
  notComingCount = 0;
  noResponseCount = 0;
  selectAll = false;

  // Add single invite
  newInvite = {
    firstName: '',
    email: '',
    note: ''
  };

  // Bulk paste ("firstName,email[,note]" per line)
  bulkText = '';

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map(p => Number(p.get('id'))),
        switchMap(id => {
          if (!id || Number.isNaN(id)) throw new Error('Invalid event id');
          this.eventId = id;
          return forkJoin({
            event: this.eventService.getById(id),
            guests: this.invitedService.getByEventId(id), // InvitedDTO[]
            files: this.eventService.getFiles(id)          // [{id,name}]
          });
        })
      )
      .subscribe({
        next: ({ event, guests, files }) => {
          this.event = event;

          const toRow = (g: InvitedDTO | any): EditableInvited => ({
          id: { eventId: g.eventId ?? g.id?.eventId, email: g.email ?? g.id?.email },
          firstName: g.firstName ?? '',
          note: g.note ?? undefined,      // convert null → undefined
          coming: g.coming ?? null,
          _editing: false,
          _selected: false
        });
          this.guests = (guests ?? []).map(toRow);

          this.files = files ?? [];
          this.computeStats();
          this.loading = false;
        },
        error: (err) => {
          this.error = err?.error?.message || err?.message || 'Failed to load event owner data';
          this.loading = false;
        }
      });
  }

  // ---------- Stats ----------
  private computeStats(): void {
    const norm = (g: EditableInvited) =>
      g.coming === true ? 'COMING' :
      g.coming === false ? 'NOT_COMING' :
      'NO_RESPONSE';

    this.totalGuests = this.guests.length;
    this.comingCount = this.guests.filter(g => norm(g) === 'COMING').length;
    this.notComingCount = this.guests.filter(g => norm(g) === 'NOT_COMING').length;
    this.noResponseCount = this.guests.filter(g => norm(g) === 'NO_RESPONSE').length;
  }

  // ---------- Helpers for template ----------
  eventName(): string {
    return this.event?.eventName ?? (this as any).event?.name ?? 'Event';
  }
  eventCode(): number | undefined {
    return this.event?.eventID ?? this.event?.eventId ?? this.event?.id;
  }
  dateFmt(): string {
    return this.event?.eventDate || '';
  }
  fullName(u?: { firstName?: string; lastName?: string }): string {
    return u ? [u.firstName, u.lastName].filter(Boolean).join(' ') : '';
  }
  guestEmail(g: EditableInvited): string {
    return g?.id?.email || '';
  }

  // ---------- Single invite add ----------
  addInvite(form: NgForm) {
    if (this.saving || !form.valid) return;
    this.saving = true;
    this.error = '';

    const payload: InviteCreateRequest = {
  eventId: this.eventId,
  email: this.newInvite.email.trim().toLowerCase(),
  firstName: this.newInvite.firstName.trim(),
  note: this.newInvite.note?.trim() || undefined
};
this.invitedService.create(payload).subscribe({
  next: (created: InvitedDTO) => {
    const row: EditableInvited = {
      id: { eventId: created.eventId, email: created.email },
      firstName: created.firstName ?? '',
      note: created.note ?? undefined,       // normalize null → undefined for UI
      coming: created.coming ?? null,
      _editing: false,
      _selected: false
    };
    this.guests.unshift(row);
    this.computeStats();
    form.resetForm();
    this.saving = false;
  },
  error: (err) => {
    this.error = err?.error?.message || 'Failed to add invite';
    this.saving = false;
  }
});
  }

  // ---------- Bulk add ----------
  addBulk() {
    if (!this.bulkText.trim()) return;

    const rows = this.bulkText
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean);

    if (!rows.length) return;

    const creations = rows.map(line => {
  const [firstName, email, note] = line.split(',').map(s => (s ?? '').trim());
  const payload: InviteCreateRequest = {
    eventId: this.eventId,
    email: email.toLowerCase(),
    firstName,
    note: note || undefined
  };
  return this.invitedService.create(payload);
});

forkJoin(creations).subscribe({
  next: (list: InvitedDTO[]) => {
    list.forEach(created => {
      const row: EditableInvited = {
        id: { eventId: created.eventId, email: created.email },
        firstName: created.firstName ?? '',
        note: created.note ?? undefined,     // normalize
        coming: created.coming ?? null,
        _editing: false,
        _selected: false
      };
      this.guests.unshift(row);
    });
    this.computeStats();
    this.bulkText = '';
    this.saving = false;
  },
  error: (err) => {
    this.error = err?.error?.message || 'Bulk add failed (check your lines)';
    this.saving = false;
  }
});
  }

  // ---------- Edit one ----------
  startEdit(g: EditableInvited) {
    g._editing = true;
    g._draftFirstName = g.firstName;
    g._draftNote = g.note ?? '';
  }
  cancelEdit(g: EditableInvited) {
    g._editing = false;
  }
  saveEdit(g: EditableInvited) {
  // Build exactly what InvitedService.update expects (no `null` in `note`)
  const upd: { eventId: number; email: string; firstName?: string; note?: string } = {
    eventId: this.eventId,
    email: this.guestEmail(g),
    firstName: g._draftFirstName?.trim() || undefined,
    note: g._draftNote?.trim() || undefined,   // normalize to undefined, never null
  };

  this.invitedService.update(upd).subscribe({
    next: (saved: Partial<InvitedDTO>) => {
      // firstName: use server value if present, otherwise what we sent, fallback to ''
      g.firstName = (saved.firstName ?? upd.firstName) ?? '';

      // note: explicitly normalize null -> undefined to satisfy EditableInvited
      const newNote: string | undefined = saved.note == null ? upd.note : saved.note;
      g.note = newNote;

      g._editing = false;
    },
    error: (err) => {
      this.error = err?.error?.message || 'Failed to save invite';
    }
  });
}

  // ---------- Delete one ----------
  deleteInvite(g: EditableInvited) {
    const email = g.id?.email!;
    this.invitedService.delete(this.eventId, email).subscribe({
      next: () => {
        this.guests = this.guests.filter(x => x !== g);
        this.computeStats();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to delete invite';
      }
    });
  }

  // ---------- Bulk select / delete ----------
  toggleSelectAll() {
    this.guests.forEach(g => g._selected = this.selectAll);
  }
  deleteSelected() {
    const targets = this.guests.filter(g => g._selected);
    if (!targets.length) return;

    const deletions = targets.map(g => this.invitedService.delete(this.eventId, g.id.email));
    forkJoin(deletions).subscribe({
      next: () => {
        this.guests = this.guests.filter(g => !g._selected);
        this.selectAll = false;
        this.computeStats();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Bulk delete failed';
      }
    });
  }

  // ---------- Files ----------
  onFilePick(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const files = input.files;
    if (!files || !files.length) return;

    this.uploading = true;
    this.error = '';
    this.eventService.uploadFiles(this.eventId, [...files]).subscribe({
      next: (list) => {
        this.files = list ?? [];
        this.uploading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Upload failed';
        this.uploading = false;
      }
    });
  }

  deleteFile(fileId: number) {
    this.eventService.deleteFile(this.eventId, fileId).subscribe({
      next: () => {
        this.files = this.files.filter(f => f.id !== fileId);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to delete file';
      }
    });
  }

  hasSelected(): boolean {
    return this.guests?.some(g => g._selected) ?? false;
  }
}
