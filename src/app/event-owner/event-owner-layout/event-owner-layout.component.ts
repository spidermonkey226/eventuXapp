import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { EventOwnerStore } from '../event-owner.store';

@Component({
  selector: 'app-event-owner-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './event-owner-layout.component.html',
  styleUrl: './event-owner-layout.component.css'
})
export class EventOwnerLayoutComponent {
  store = inject(EventOwnerStore);

  eventName(e?: any) { return e?.eventName ?? e?.name ?? 'Event'; }
  eventCode(e?: any) { return e?.eventID ?? e?.eventId ?? e?.id; }
}
