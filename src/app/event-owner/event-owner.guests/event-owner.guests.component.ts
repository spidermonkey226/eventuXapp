import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { EventOwnerStore, EditableInvited } from '../event-owner.store';

@Component({
  selector: 'app-event-owner.guests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-owner.guests.component.html',
  styleUrls: ['./event-owner.guests.component.css','../event-owner.component.css']
})
export class EventOwnerGuestsComponent {
  store = inject(EventOwnerStore);

  selectAll = false;
  newInvite = { firstName:'', email:'', note:'' };
  bulkText = '';
  saving = false;

  guestEmail(g: EditableInvited) { return g?.id?.email || ''; }

  addInvite(form: NgForm) {
    if (!form.valid || this.saving) return;
    this.saving = true;
    const payload = {
      eventId: this.store.eventId,
      email: this.newInvite.email.trim().toLowerCase(),
      firstName: this.newInvite.firstName.trim(),
      note: this.newInvite.note?.trim() || undefined
    };
    this.store.createInvite(payload).subscribe({
      next: () => { form.resetForm(); this.saving = false; },
      error: (e) => { this.store.error$.next(e?.error?.message || 'Failed to add invite'); this.saving=false; }
    });
  }
  resendInvite(g: EditableInvited) {
    this.store.resendInvite(g.id.email).subscribe({
      next: () => this.store.error$.next(`Invitation re-sent to ${g.id.email}`),
      error: (e) => this.store.error$.next(e?.error?.message || 'Failed to resend invite')
    });
  }

  addBulk() {
    if (!this.bulkText.trim()) return;
    const rows = this.bulkText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (!rows.length) return;
    this.saving = true;

    const creations = rows.map(line => {
      const [firstName, email, note] = line.split(',').map(s => (s??'').trim());
      return this.store.createInvite({
        eventId: this.store.eventId, email: email.toLowerCase(), firstName, note: note || undefined
      });
    });

    forkJoin(creations).subscribe({
      next: () => { this.bulkText=''; this.saving=false; },
      error: (err) => { this.store.error$.next(err?.error?.message || 'Bulk add failed'); this.saving=false; }
    });
  }

  startEdit(g: EditableInvited) { g._editing = true; g._draftFirstName = g.firstName; g._draftNote = g.note ?? ''; }
  cancelEdit(g: EditableInvited) { g._editing = false; }

  saveEdit(g: EditableInvited) {
    const data = {
      firstName: g._draftFirstName?.trim() || undefined,
      note: g._draftNote?.trim() || undefined
    };
    this.store.updateInvite(this.guestEmail(g), data).subscribe({
      next: () => { g._editing = false; },
      error: (e) => this.store.error$.next(e?.error?.message || 'Failed to save invite')
    });
  }

  deleteInvite(g: EditableInvited) {
    this.store.deleteInvite(this.guestEmail(g)).subscribe({
      error: (e) => this.store.error$.next(e?.error?.message || 'Failed to delete invite')
    });
  }

  toggleSelectAll() {
    const gs = this.store.guests$.value.map(g => ({...g, _selected: this.selectAll}));
    this.store.guests$.next(gs);
  }
  hasSelected() { return this.store.guests$.value.some(g => g._selected); }

  deleteSelected() {
    const emails = this.store.guests$.value.filter(g => g._selected).map(g => g.id.email);
    if (!emails.length) return;
    this.store.deleteInvites(emails).subscribe({
      error: (e) => this.store.error$.next(e?.error?.message || 'Bulk delete failed')
    });
  }
}
