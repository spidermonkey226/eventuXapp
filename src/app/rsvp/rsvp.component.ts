import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InvitedService } from '../services/invited.service';
import { Invited } from '../class/invited';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rsvp',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './rsvp.component.html',
  styleUrl: './rsvp.component.css'
})
export class RsvpComponent implements OnInit {
  eventId: string | null = null;
  token: string | null = null;

  guest!: Invited;
  event: any;
  response: 'yes' | 'no' | null = null;
  note: string = '';
  error: string = '';
  confirmed: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private invitedService: InvitedService
  ) {}

ngOnInit() {
  this.eventId = this.route.snapshot.queryParamMap.get('eventId');
  this.token = this.route.snapshot.queryParamMap.get('token');

  if (this.token) {
    this.invitedService.getByToken(this.token).subscribe({
      next: (invited) => {
        this.guest = invited;
        this.event = invited.event;
      },
      error: (err) => {
        console.error('Invalid token or guest not found', err);
        this.error = 'Invalid or expired RSVP link.';
      }
    });
  } else {
    // ✅ TEST MODE: inject mock guest + event
    this.guest = {
      id: {
        eventId: 999,
        email: 'test@example.com'
      },
      firstName: 'Test User',
      event: {
        eventId: 999,
        name: 'Mock Test Event'
      },
      token: 'mock-token'
    };

    this.event = {
      name: 'Mock Test Event',
      rsvpSettings: {
        customMessage: 'This is a test RSVP page.',
        questionText: 'Do you want to join the mock event?',
        showNote: true,
        buttonText: 'Submit Test RSVP',
        theme: 'default'
      }
    };
  }
}


  submit() {
  if (!this.guest || !this.response) return;

  // Try all known shapes to extract eventId + email safely
  const eventId =
    this.guest?.id?.eventId ??
    this.guest?.event?.eventId ??
    (this as any)?.event?.eventId ??
    (this as any)?.event?.id ??
    (this.guest as any)?.eventId; // last resort if backend flattens it

  const email =
    this.guest?.id?.email ??
    (this.guest as any)?.email;

  if (!eventId || !email) {
    console.error('Missing eventId or email on guest:', this.guest);
    this.error = 'Something went wrong. Your RSVP link seems incomplete.';
    return;
  }

  const coming = this.response === 'yes';

  this.invitedService
    .updateStatus(eventId, email, coming, this.note)
    .subscribe({
      next: () => (this.confirmed = true),
      error: (err) => {
        console.error('Failed to submit RSVP', err);
        this.error = 'Something went wrong. Please try again later.';
      },
    });
}
  
}