import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventOwnerStore } from '../event-owner.store';
import { TicketService, TicketMessage } from '../../services/ticket.service';

type AnyTicket = any;

@Component({
  selector: 'app-event-owner-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-owner.reports.component.html',     // ✅ single .component
  styleUrls: ['./event-owner.reports.component.css',       // ✅ styleUrls (array)
              '../event-owner.component.css']              // reuse shared look
})
export class EventOwnerReportsComponent {
 private svc = inject(TicketService);
  store = inject(EventOwnerStore);

  loading = true;
  error = '';

  tickets: AnyTicket[] = [];
  messages: Record<number, TicketMessage[]> = {};
  drafts:   Record<number, string> = {};
  openThreadId: number | null = null;
  sending = false;

  ngOnInit() { this.loadTickets(); }
  
  // ---- helpers to normalize all possible shapes coming from the API ----
  private pickId(t: any): number | undefined {
    return t?.ticketId ?? t?.id;
  }
  private pickEventId(t: any): number | undefined {
    const raw =
      t?.eventId ??
      t?.event?.eventID ??
      t?.event?.eventId ??
      t?.event?.id ??
      t?.event_id; // just in case
    return typeof raw === 'string' ? Number(raw) : raw;
  }
  getId(t: any): number | undefined {
    return this.pickId(t);
  }

  getTitle(t: any)   { return t?.ticketTitle ?? t?.title ?? ''; }
  getContent(t: any) { return t?.ticketContent ?? t?.content ?? ''; }
  getPreview(t: any) { return (this.getContent(t) || '').slice(0, 120); }
  getReporter(t: any){ return t?.reporterEmail ?? t?.reporter?.email ?? t?.reporter ?? ''; }
  getCreatedAt(t: any){ return t?.createdAt ?? t?.created_at ?? t?.createdOn; }

  private getStatusRaw(t: any): string {
    // backend might use 'status' or 'ticketStatus'
    return (t?.status ?? t?.ticketStatus ?? '').toString();
  }
  getStatusUpper(t: any): 'OPEN'|'IN_PROGRESS'|'CLOSED'|string {
    const s = this.getStatusRaw(t).toUpperCase();
    if (s === 'OPEN' || s === 'IN_PROGRESS' || s === 'CLOSED') return s;
    return s || 'OPEN';
  }
  private toApiStatus(ui: string): string {
    // UI shows UPPERCASE, API expects lowercase (open/in_progress/closed)
    return (ui || '').toLowerCase();
  }

  // ---- data flow ----
  loadTickets() {
    this.loading = true; this.error = '';
    this.svc.getAll().subscribe({
      next: (list: any[]) => {
        const eid = Number(this.store.eventId);
        const arr = Array.isArray(list) ? list : [];
        // Keep only tickets that belong to this event, robust to either shape
        this.tickets = arr.filter(t => Number(this.pickEventId(t)) === eid);
        // Newest first (optional)
        this.tickets.sort((a, b) => (this.pickId(b) ?? 0) - (this.pickId(a) ?? 0));
        this.loading = false;
      },
      error: e => {
        this.error = e?.error?.message || 'Failed to load tickets';
        this.tickets = [];
        this.loading = false;
      }
    });
  }

  changeStatus(t: any, uiStatus: string) {
    const id = this.pickId(t); if (id == null) return;
    const apiStatus = this.toApiStatus(uiStatus);
    this.svc.updateStatus(id, apiStatus).subscribe({
      next: (upd) => {
        const i = this.tickets.findIndex(x => this.pickId(x) === id);
        if (i >= 0) this.tickets[i] = { ...this.tickets[i], ...(upd ?? {}), status: apiStatus };
      },
      error: e => this.error = e?.error?.message || 'Failed to update status'
    });
  }

  remove(t: any) {
    const id = this.pickId(t); if (id == null) return;
    this.svc.delete(id).subscribe({
      next: () => {
        this.tickets = this.tickets.filter(x => this.pickId(x) !== id);
        delete this.messages[id];
        delete this.drafts[id];
        if (this.openThreadId === id) this.openThreadId = null;
      },
      error: e => this.error = e?.error?.message || 'Failed to delete ticket'
    });
  }

  toggleThread(ticketId: number) {
    if (this.openThreadId === ticketId) { this.openThreadId = null; return; }
    this.openThreadId = ticketId;
    if (!this.messages[ticketId]) this.loadMessages(ticketId);
  }

  loadMessages(ticketId: number) {
    this.svc.getMessages(ticketId).subscribe({
      next: (msgs) => {
        this.messages[ticketId] = (msgs || []).slice().sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      },
      error: () => { this.messages[ticketId] = []; }
    });
  }

  sendMessage(ticketId: number) {
    const t = this.tickets.find(x => this.pickId(x) === ticketId);
    if (!t) return;
    if (this.getStatusUpper(t) === 'CLOSED') {
      alert('This conversation is closed. You can’t send new messages.');
      return;
    }
    const text = (this.drafts[ticketId] || '').trim();
    if (!text) return;

    this.sending = true;
    this.svc.addMessage(ticketId, text, 'ADMIN').subscribe({
      next: m => {
        if (!this.messages[ticketId]) this.messages[ticketId] = [];
        this.messages[ticketId] = [...this.messages[ticketId], m];
        this.drafts[ticketId] = '';
      },
      error: () => alert('Failed to send message.'),
      complete: () => { this.sending = false; }
    });
  }

  trackById = (_: number, t: any) => this.pickId(t);
}
