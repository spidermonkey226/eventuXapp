import { Component, OnInit } from '@angular/core';
import { Ticket } from '../../class/ticket';
import { TicketService } from '../../services/ticket.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

@Component({
  selector: 'app-ticket-replay',
  standalone: true,
  imports: [BrowserModule,CommonModule,FormsModule],
  templateUrl: './ticket-replay.component.html',
  styleUrl: './ticket-replay.component.css'
})
export class TicketReplayComponent implements OnInit{
  tickets: Ticket[] = [];
  filtered: Ticket[] = [];

  // UI state
  loading = false;
  saving = false;
  errorMsg = '';
  successMsg = '';

  selected: Ticket | null = null;
  replyText = '';
  statuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const;
  searchTerm = '';

  constructor(private ticketService: TicketService) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  // --- Load & filter ---
  loadTickets(): void {
    this.loading = true;
    this.errorMsg = '';

    this.ticketService.getAll().subscribe({
      next: (data) => {
        this.tickets = Array.isArray(data) ? data : [];

        // If no data came back, inject some mock examples so UI still works
        if (this.tickets.length === 0) {
          this.tickets = [
            new Ticket('Login issue', 'OPEN', 'User cannot log in', { name: 'Alice' }, { name: 'Event A' }, 1),
            new Ticket('Payment failed', 'IN_PROGRESS', 'Payment gateway error', { name: 'Bob' }, { name: 'Event B' }, 2),
            new Ticket('Feature request', 'RESOLVED', 'User wants dark mode', { name: 'Charlie' }, { name: 'Event C' }, 3),
          ];
        }

        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Failed to load tickets. Showing mock data.';
        this.loading = false;

        // If backend fails, show mock data
        this.tickets = [
          new Ticket('Mock Ticket 1', 'OPEN', 'Example ticket one', { name: 'Test User' }, { name: 'Mock Event' }, 101),
          new Ticket('Mock Ticket 2', 'RESOLVED', 'Example ticket two', { name: 'Demo User' }, { name: 'Mock Event' }, 102),
        ];
        this.applyFilter();
      }
    });
  }

  applyFilter(): void {
    const q = this.searchTerm.trim().toLowerCase();
    if (!q) {
      this.filtered = [...this.tickets];
      return;
    }
    this.filtered = this.tickets.filter(t =>
      (t.ticketTitle?.toLowerCase().includes(q)) ||
      (t.ticketContent?.toLowerCase().includes(q)) ||
      (t.ticketStatus?.toLowerCase().includes(q)) ||
      (String(t.ticketId).includes(q))
    );
  }

  // --- Selection ---
  selectTicket(ticket: Ticket): void {
    this.selected = { ...ticket };
    this.replyText = '';
    this.successMsg = '';
    this.errorMsg = '';
  }

  cancelSelection(): void {
    this.selected = null;
    this.replyText = '';
  }

  // --- Actions: reply & status ---
  sendReply(): void {
    if (!this.selected) return;
    const reply = this.replyText.trim();
    if (!reply) {
      this.errorMsg = 'Reply cannot be empty.';
      return;
    }

    this.saving = true;
    this.errorMsg = '';
    this.successMsg = '';
    this.ticketService.reply(this.selected.ticketId, reply).subscribe({
      next: (updated) => {
        this.upsert(updated);
        this.saving = false;
        this.replyText = '';
        this.successMsg = 'Reply sent.';
      },
      error: (err) => {
        console.error(err);
        this.saving = false;
        this.errorMsg = 'Failed to send reply.';
      }
    });
  }

  changeStatus(newStatus: string): void {
    if (!this.selected) return;
    if (!this.statuses.includes(newStatus as any)) {
      this.errorMsg = 'Invalid status.';
      return;
    }

    this.saving = true;
    this.errorMsg = '';
    this.successMsg = '';
    this.ticketService.updateStatus(this.selected.ticketId, newStatus).subscribe({
      next: (updated) => {
        this.upsert(updated);
        this.selected = { ...updated };
        this.saving = false;
        this.successMsg = 'Status updated.';
      },
      error: (err) => {
        console.error(err);
        this.saving = false;
        this.errorMsg = 'Failed to update status.';
      }
    });
  }

  saveEdits(): void {
    if (!this.selected) return;
    this.saving = true;
    this.errorMsg = '';
    this.successMsg = '';
    this.ticketService.update(this.selected).subscribe({
      next: (updated) => {
        this.upsert(updated);
        this.selected = { ...updated };
        this.saving = false;
        this.successMsg = 'Ticket updated.';
      },
      error: (err) => {
        console.error(err);
        this.saving = false;
        this.errorMsg = 'Failed to update ticket.';
      }
    });
  }

  // --- Utils ---
  private upsert(updated: Ticket): void {
    const idx = this.tickets.findIndex(t => t.ticketId === updated.ticketId);
    if (idx > -1) {
      this.tickets[idx] = updated;
    } else {
      this.tickets.unshift(updated);
    }
    this.applyFilter();
  }

  trackById = (_: number, t: Ticket) => t.ticketId;
}
