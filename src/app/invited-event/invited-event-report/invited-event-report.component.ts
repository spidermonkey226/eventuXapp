import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EventService,EventDetail } from '../../services/event.service';
import { TicketService } from '../../services/ticket.service';
import { Ticket } from '../../class/ticket';
import { UserService } from '../../services/user.service';


@Component({
  selector: 'app-invited-event-report',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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

  // we’ll try to include the signed-in user as the reporter
  private reporterValue: string | number | null = null;

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

    // get signed-in identity to use as reporter (email preferred)
    this.users.getMe().subscribe({
      next: (me) => {
        if (me?.email) this.reporterValue = String(me.email);
        else if (me?.id != null) this.reporterValue = Number(me.id);
      },
      error: () => { /* fine if not signed in */ }
    });
  }

  submit(): void {
    this.successMsg = '';
    this.errorMsg = '';
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.submitting = true;
    const v = this.form.value;

    // IMPORTANT: put eventId to route this to the event creator
    const payload = new Ticket(
      v.ticketTitle!,
      'OPEN',
      v.ticketContent!,
      this.reporterValue,        // email or userId if available; otherwise null
      this.eventId,              // event id is the key difference here
      0
    );

    this.tickets.create(payload).subscribe({
      next: () => {
        this.successMsg = 'Thanks! Your report was sent to the event owner.';
        this.form.reset();
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Failed to submit the event report.';
      },
      complete: () => { this.submitting = false; }
    });
  }

}
