import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EventService,EventDetail } from '../../services/event.service';
import { TicketService,TicketMessage } from '../../services/ticket.service';
import { Ticket } from '../../class/ticket';
import { UserService } from '../../services/user.service';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-invited-event-report',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,FormsModule],
  templateUrl: './invited-event-report.component.html',
  styleUrl: './invited-event-report.component.css'
})
export class InvitedEventReportComponent implements OnInit {
 form!: FormGroup;
  submitting = false;
  successMsg = '';
  errorMsg = '';

  eventId!: number;
  event?: EventDetail;
  loadingEvent = true;

  // Identity (prefer email)
  private reporterValue: string | number | null = null;
  meEmail: string | null = null;
  meId: number | null = null;

  // My tickets for THIS event
  loadingList = false;
  listError = '';
  searchTerm = '';

  myTickets: any[] = [];
  filtered: any[] = [];

  // chat state
  openThreadId: number | null = null;
  messages: Record<number, TicketMessage[]> = {};
  drafts: Record<number, string> = {};
  sending = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private events: EventService,
    private tickets: TicketService,
    private users: UserService
  ) {
    this.form = this.fb.group({
      ticketTitle: ['', [Validators.required, Validators.minLength(3)]],
      ticketContent: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  get f() { return this.form.controls; }

  ngOnInit(): void {
    // event id from /invited-event/:id/report (child route)
    this.eventId = Number(this.route.parent?.snapshot.paramMap.get('id') ?? this.route.snapshot.paramMap.get('id'));
    if (!this.eventId || Number.isNaN(this.eventId)) {
      this.loadingEvent = false;
      this.errorMsg = 'Invalid event id';
      return;
    }

    // load event basics for header
    this.events.getById(this.eventId).subscribe({
      next: (ev) => { this.event = ev; this.loadingEvent = false; },
      error: (err) => { this.errorMsg = err?.error?.message || 'Failed to load event'; this.loadingEvent = false; }
    });

    // identity (for create + filtering)
    this.users.getMe().subscribe({
      next: (me) => {
        if (me?.email) {
          this.meEmail = String(me.email).trim().toLowerCase();
          this.reporterValue = this.meEmail;
        } else if (me?.id != null) {
          this.meId = Number(me.id);
          this.reporterValue = this.meId;
        }
        this.loadMyReports();
      },
      error: () => {
        // anonymous users: allow reporting but list will be empty
        this.loadMyReports();
      }
    });
  }

  submit(): void {
    this.successMsg = '';
    this.errorMsg = '';
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.submitting = true;
    const v = this.form.value;

    // include eventId so backend routes this to the event owner
    const payload = new Ticket(
      v.ticketTitle!,
      'OPEN',
      v.ticketContent!,
      this.reporterValue,    // email or userId if available
      this.eventId,          // <= key difference from app ticket
      0
    );

    this.tickets.create(payload).subscribe({
      next: () => {
        this.successMsg = 'Thanks! Your report was sent to the event owner.';
        this.form.reset();
        this.loadMyReports(); // refresh list
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Failed to submit the event report.';
      },
      complete: () => { this.submitting = false; }
    });
  }

  // -------- list + search (only my tickets for THIS event) --------
  loadMyReports(): void {
    this.loadingList = true;
    this.listError = '';
    this.tickets.getAll().subscribe({
      next: (data: any[]) => {
        const list = Array.isArray(data) ? data : [];

        // Backend returns TicketDTO: ticketId, ticketTitle, ticketStatus, ticketContent, eventId, reporterEmail
        this.myTickets = list.filter((t: any) => {
          // must be this event
          const isThisEvent = Number(t.eventId ?? -1) === this.eventId;
          if (!isThisEvent) return false;

          // must be current user (by email or id)
          const email = (t.reporterEmail || t.reporter?.email || '').toLowerCase();
          const idLike = (t.reporter?.id ?? t.reporterId ?? null);
          const isMine = (this.meEmail && email === this.meEmail) ||
                         (this.meId != null && idLike === this.meId);
          return isMine;
        });

        this.myTickets.sort((a, b) => (b.ticketId ?? 0) - (a.ticketId ?? 0));
        this.applyFilter();
      },
      error: (err) => {
        console.error(err);
        this.listError = 'Could not load your reports.';
        this.myTickets = [];
        this.filtered = [];
      },
      complete: () => { this.loadingList = false; }
    });
  }

  applyFilter(): void {
    const q = (this.searchTerm || '').trim().toLowerCase();
    if (!q) {
      this.filtered = [...this.myTickets];
      return;
    }
    this.filtered = this.myTickets.filter((t: any) => {
      const title = (t.ticketTitle || '').toLowerCase();
      const content = (t.ticketContent || '').toLowerCase();
      const status = (t.ticketStatus || '').toLowerCase();
      const idStr = String(t.ticketId || '');
      return title.includes(q) || content.includes(q) || status.includes(q) || idStr.includes(q);
    });
  }

  // -------- chat / ping-pong --------
  toggleThread(ticketId: number): void {
    if (this.openThreadId === ticketId) {
      this.openThreadId = null;
      return;
    }
    this.openThreadId = ticketId;
    if (!this.messages[ticketId]) {
      this.loadMessages(ticketId);
    }
  }

  loadMessages(ticketId: number): void {
    this.tickets.getMessages(ticketId).subscribe({
      next: (msgs) => {
        this.messages[ticketId] = (msgs || []).slice().sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      },
      error: (err) => {
        console.error(err);
        this.messages[ticketId] = [];
      }
    });
  }

  sendMessage(ticketId: number): void {
    const row = this.filtered.find(x => x.ticketId === ticketId);
    // prevent sending if CLOSED (UI also hides composer, but this is a safe guard)
    if (row && row.ticketStatus === 'CLOSED') return;

    const text = (this.drafts[ticketId] || '').trim();
    if (!text) return;

    this.sending = true;
    this.tickets.postMessage(ticketId, text, 'USER').subscribe({
      next: (m) => {
        if (!this.messages[ticketId]) this.messages[ticketId] = [];
        this.messages[ticketId] = [...this.messages[ticketId], m];
        this.drafts[ticketId] = '';
      },
      error: (err) => {
        console.error(err);
        alert('Failed to send message.');
      },
      complete: () => { this.sending = false; }
    });
  }

  trackById = (_: number, t: any) => t.ticketId;
}
