import { Component ,OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TicketService,TicketMessage } from '../../services/ticket.service';
import { Ticket } from '../../class/ticket';

@Component({
  selector: 'app-ticket-conversation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ticket-conversation.component.html',
  styleUrl: './ticket-conversation.component.css'
})
export class TicketConversationComponent implements OnInit {
  ticketId!: number;
  ticket?: Ticket;
  messages: TicketMessage[] = [];
  loading = false;
  sending = false;
  errorMsg = '';
  text = '';

  constructor(private route: ActivatedRoute, private tickets: TicketService) {}

  ngOnInit(): void {
    this.ticketId = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMsg = '';

    // load ticket header + messages
    this.tickets.getById(this.ticketId).subscribe({
      next: t => this.ticket = t,
      error: () => {}
    });

    this.tickets.getMessages(this.ticketId).subscribe({
      next: list => { this.messages = list || []; this.loading = false; },
      error: err => { this.errorMsg = 'Failed to load messages.'; this.loading = false; }
    });
  }

  send(): void {
    const txt = (this.text || '').trim();
    if (!txt) return;
    this.sending = true;

    this.tickets.postMessage(this.ticketId, txt, 'ADMIN').subscribe({
      next: msg => {
        this.messages.push(msg);
        this.text = '';
        this.sending = false;
      },
      error: err => {
        this.errorMsg = 'Failed to send.';
        this.sending = false;
      }
    });
  }

  cls(m: TicketMessage) {
    return m.sender === 'ADMIN' ? 'bubble admin' : 'bubble user';
  }

}
