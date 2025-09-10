import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TicketService ,TicketMessage} from '../services/ticket.service';
import { Ticket } from '../class/ticket';
import { UserService } from '../services/user.service';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-report-ticket',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,FormsModule],
  templateUrl: './report-ticket.component.html',
  styleUrl: './report-ticket.component.css'
})
export class ReportTicketComponent implements OnInit{
   form!: FormGroup;
  submitting = false;
  successMsg = '';
  errorMsg = '';

  private reporterValue: string | number | null = null;

  meEmail: string | null = null;
  meId: number | null = null;

  loadingList = false;
  listError = '';
  searchTerm = '';

  myTickets: any[] = [];
  filtered: any[] = [];

  openThreadId: number | null = null;
  messages: Record<number, TicketMessage[]> = {};
  drafts: Record<number, string> = {};
  sending = false;

  constructor(
    private fb: FormBuilder,
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
    // load identity, then load my reports
    this.users.getMe().subscribe({
      next: (me) => {
        if (me?.email) {
          this.meEmail = String(me.email).trim().toLowerCase();
          this.reporterValue = this.meEmail;             // prefer email for create()
        } else if (me?.id != null) {
          this.meId = Number(me.id);
          this.reporterValue = this.meId;                // fallback to id
        }
        this.loadMyReports();
      },
      error: () => {
        // not signed in? still allow reporting (anonymous), but list will be empty
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

    // event is null — app issue
    const payload = new Ticket(
      v.ticketTitle!,
      'OPEN',
      v.ticketContent!,
      this.reporterValue,   // string email or number id or null
      null,                 // eventId
      0                     // ticketId (ignored by backend)
    );

    this.tickets.create(payload).subscribe({
      next: () => {
        this.successMsg = 'Thanks! Your ticket was sent to app support.';
        this.form.reset();
        this.loadMyReports();  // refresh my list
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Failed to submit the ticket.';
      },
      complete: () => { this.submitting = false; }
    });
  }

  // ---------------- my reports list + search ----------------
  loadMyReports(): void {
    this.loadingList = true;
    this.listError = '';
    this.tickets.getAll().subscribe({
      next: (data: any[]) => {
        const list = Array.isArray(data) ? data : [];
        // Backend sends TicketDTO (ticketId, ticketTitle, ticketStatus, ticketContent, eventId, reporterEmail)
        // Filter by current user: prefer email; if not available, try matching a numeric reporter (if backend ever returns it)
        this.myTickets = list.filter((t: any) => {
          const email = (t.reporterEmail || t.reporter?.email || '').toLowerCase();
          const idLike = (t.reporter?.id ?? t.reporterId ?? null);
          return (this.meEmail && email === this.meEmail) ||
                 (this.meId != null && idLike === this.meId);
        });

        // newest first if you like; otherwise remove sort
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

  // ---------------- chat (“ping-pong”) ----------------
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
        // ensure chronological
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
     const t = this.myTickets.find(x => x.ticketId === ticketId);
    if (t && t.ticketStatus === 'CLOSED') {
      alert('This conversation is closed. You can’t send new messages.');
      return;
    }

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
        // optional: show a small error near the input
        alert('Failed to send message.');
      },
      complete: () => { this.sending = false; }
    });
  }

  trackById = (_: number, t: any) => t.ticketId;
}