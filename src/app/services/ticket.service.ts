import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ticket } from '../class/ticket';

export interface TicketMessage {
  id: number;
  sender: 'USER' | 'ADMIN';
  text: string;
  createdAt: string; // ISO
}

@Injectable({
  providedIn: 'root'
})

export class TicketService {
  private baseUrl = 'http://localhost:8080/api/tickets';
  
  constructor(private http: HttpClient) {}

  // Get all tickets
  getAll(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.baseUrl);
  }

  // Get a ticket by ticketId
  getById(ticketId: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.baseUrl}/${ticketId}`);
  }

  // Create a new ticket
 create(ticket: Ticket): Observable<Ticket> {
    const t: any = ticket;

    // Map fields from your class to the DTO shape the backend expects
    const body: any = {
      ticketTitle: t.ticketTitle ?? t.title ?? '',
      ticketContent: t.ticketContent ?? t.content ?? '',
    };

    // reporter: either email (string) or id (number)
    const reporter = t.reporter ?? t.reporterId ?? t.reporterEmail;
    if (typeof reporter === 'string' && reporter.trim()) {
      body.reporterEmail = reporter.trim();
    } else if (typeof reporter === 'number') {
      body.reporterId = reporter;
    }

    // eventId: allow number or object with id-like fields, ignore null/undefined
    const event = t.event ?? t.eventId;
    if (event !== null && event !== undefined) {
      if (typeof event === 'number') {
        body.eventId = event;
      } else if (typeof event === 'object') {
        body.eventId = event.eventID ?? event.eventId ?? event.id ?? undefined;
      }
    }

    // POST the DTO (backend returns TicketDTO; we keep <Ticket> to avoid refactors)
    return this.http.post<Ticket>(this.baseUrl, body);
  }

  // Update an existing ticket (reply, status, etc.)
  update(ticket: Ticket): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.baseUrl}/${ticket.ticketId}`, ticket);
  }

  // Change only the status of a ticket
  updateStatus(ticketId: number, status: string): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.baseUrl}/${ticketId}/status`, { status });
  }

  // Reply to a ticket
  reply(ticketId: number, reply: string): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.baseUrl}/${ticketId}/reply`, { reply });
  }
  getMessages(ticketId: number): Observable<TicketMessage[]> {
    return this.http.get<TicketMessage[]>(`${this.baseUrl}/${ticketId}/messages`);
  }

  postMessage(ticketId: number, text: string, sender: 'USER'|'ADMIN'='ADMIN'): Observable<TicketMessage> {
    return this.http.post<TicketMessage>(`${this.baseUrl}/${ticketId}/messages`, { text, sender });
  }
  addMessage(ticketId: number, text: string, sender: 'USER'|'ADMIN'='ADMIN') {
    return this.postMessage(ticketId, text, sender);
  }
  getByReporterEmail(email: string) {
    return this.http.get<Ticket[]>(`${this.baseUrl}/by-reporter`, { params: { email } });
  }
  // Delete a ticket by ticketId
  delete(ticketId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${ticketId}`);
  }
}