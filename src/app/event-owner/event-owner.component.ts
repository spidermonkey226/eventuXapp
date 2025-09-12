import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { EventOwnerStore } from './event-owner.store';

@Component({
  selector: 'app-event-owner',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './event-owner.component.html',
  styleUrls: ['./event-owner.component.css']
})
export class EventOwnerComponent {
  store = inject(EventOwnerStore);
  managerDisplay(e?: any): string {
  const m = e?.manager;
  const name = [m?.firstName, m?.lastName]
    .filter((v: string | undefined) => !!v)
    .join(' ')
    .trim();
  return name || m?.email || '';
}
  // tiny helpers for header
  eventName(e?: any) { return e?.eventName ?? e?.name ?? 'Event'; }
  eventCode(e?: any) { return e?.eventID ?? e?.eventId ?? e?.id; }
}
