import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../services/ticket.service';
import { Ticket } from '../class/ticket';

type Msg = { sender: 'user' | 'admin'; text: string; at: string };

@Component({
  selector: 'app-report-ticket',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './report-ticket.component.html',
  styleUrl: './report-ticket.component.css'
})
export class ReportTicketComponent implements OnInit{
   submitting = false;
  successMsg = '';
  errorMsg = '';
  form!: FormGroup;

  // history list
  myTickets: Ticket[] = [];

  // identity (adjust as needed)
  private userId: number | null = null;
  private email: string | null = null;

  // demo toggle
  readonly MOCK = true;

  // thread state
  openThreadId: number | null = null;
  messages: Record<number, Msg[]> = {};
  drafts: Record<number, string> = {};
  sending = false;

  constructor(private fb: FormBuilder, private tickets: TicketService) {
    this.form = this.fb.group({
      ticketTitle: ['', [Validators.required, Validators.minLength(3)]],
      ticketContent: ['', [Validators.required, Validators.minLength(10)]],
      reporter: [''],
      event: [''],
    });
  }

  ngOnInit(): void {
    const idRaw = localStorage.getItem('userId');
    this.userId = idRaw != null && idRaw !== '' ? Number(idRaw) : null;
    this.email = localStorage.getItem('email') || null;
    this.loadMyTickets();
  }

  get f() { return this.form.controls; }

  submit(): void {
    this.successMsg = '';
    this.errorMsg = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const v = this.form.value;

    const payload = new Ticket(
      v.ticketTitle!,           // title
      'OPEN',                   // status (admin-only later)
      v.ticketContent!,         // content
      v.reporter ?? this.email ?? this.userId ?? null, // reporter
      v.event ?? null,          // event
      0
    );

    this.tickets.create(payload).subscribe({
      next: () => {
        this.successMsg = 'Ticket submitted.';
        this.form.reset({ reporter: '', event: '' });
        this.loadMyTickets();
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Failed to submit ticket.';
      },
      complete: () => { this.submitting = false; },
    });
  }

  toggleThread(id: number): void {
    if (!this.messages[id]) this.loadMessages(id);
    this.openThreadId = this.openThreadId === id ? null : id;
  }

  sendReply(id: number): void {
    const text = (this.drafts[id] || '').trim();
    if (!text) return;

    const t = this.myTickets.find(x => x.ticketId === id);
    if (!t || t.ticketStatus !== 'OPEN') return; // only allow replies when OPEN

    this.sending = true;

    if (this.MOCK) {
      if (!this.messages[id]) this.messages[id] = [];
      this.messages[id].push({ sender: 'user', text, at: new Date().toISOString() });
      this.drafts[id] = '';
      this.sending = false;
      return;
    }

    // TODO: replace with real API when available:
    // this.tickets.reply(id, text).subscribe({
    //   next: msgs => { this.messages[id] = msgs; this.drafts[id] = ''; },
    //   error: () => {},
    //   complete: () => { this.sending = false; }
    // });

    // temp fallback without API:
    if (!this.messages[id]) this.messages[id] = [];
    this.messages[id].push({ sender: 'user', text, at: new Date().toISOString() });
    this.drafts[id] = '';
    this.sending = false;
  }

  private loadMessages(id: number): void {
    if (this.MOCK) {
      this.messages[id] = [
        { sender: 'user',  text: 'I uploaded files but it fails.', at: '2025-08-10 14:22' },
        { sender: 'admin', text: 'You were uploading PDFs; only images allowed.', at: '2025-08-10 14:40' },
        { sender: 'user',  text: 'Retried with JPGs. Works now.', at: '2025-08-10 15:01' },
        { sender: 'admin', text: 'Good — marking as RESOLVED.', at: '2025-08-10 15:05' },
      ];
      return;
    }
    // later: load from API if available
    // this.tickets.getMessages(id).subscribe(res => this.messages[id] = res);
  }

  private loadMyTickets(): void {
    if (this.MOCK) {
      this.myTickets = [
        new Ticket('Login issue', 'OPEN', 'Can’t sign in after password reset.', 'me@example.com', null, 101),
        new Ticket('Payment failed', 'IN_PROGRESS', 'Card declined when upgrading.', 'me@example.com', 42, 102),
        new Ticket('Photo upload error', 'RESOLVED', 'Uploader stuck at 95%.', 'me@example.com', 17, 103),
        new Ticket('Wrong event date', 'CLOSED', 'Date showed 2026 instead of 2025.', 'me@example.com', 3, 104),
      ];
      return;
    }

    this.tickets.getAll().subscribe({
      next: (list) => {
        const id = this.userId;
        const email = this.email;
        this.myTickets = (list || []).filter((t: any) => {
          const r = t?.reporter;
          return (
            (id != null && (r?.id === id || r === id)) ||
            (email != null && (r?.email === email || r === email))
          );
        });
      },
      error: (err) => {
        console.error(err);
        this.myTickets = [];
      },
    });
  }
}
