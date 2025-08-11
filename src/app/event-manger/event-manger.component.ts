import { Component ,OnInit} from '@angular/core';
import { InvitedService } from '../services/invited.service';
import { Invited } from '../class/invited';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-event-manger',
  imports: [CommonModule],
  templateUrl: './event-manger.component.html',
  styleUrl: './event-manger.component.css'
})
export class EventManagerComponent implements OnInit {
  guests: Invited[] = [];

  // Event info
  eventName: string = '';
  eventId: number | null = null;

  // Statistics
  totalGuests = 0;
  comingCount = 0;
  notComingCount = 0;
  noResponseCount = 0;

  constructor(private invitedService: InvitedService) {}

  ngOnInit(): void {
    this.loadGuests();
  }

  loadGuests(): void {
    this.invitedService.getAll().subscribe({
      next: (data: Invited[]) => {
        this.guests = data;
        this.calculateStats();

        // Extract event info (assumes all guests are for the same event)
        if (this.guests.length > 0) {
          this.eventName = this.guests[0].event.name;
          this.eventId = this.guests[0].event.eventId;
        }
      },
      error: (err) => {
        console.error('Failed to load invited guests', err);
      }
    });
  }

  calculateStats(): void {
    this.totalGuests = this.guests.length;
    this.comingCount = this.guests.filter(g => g.coming === true).length;
    this.notComingCount = this.guests.filter(g => g.coming === false).length;
    this.noResponseCount = this.guests.filter(g => g.coming === undefined || g.coming === null).length;
  }
}