import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ticket } from '../class/ticket';

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
    return this.http.post<Ticket>(this.baseUrl, ticket);
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

  // Delete a ticket by ticketId
  delete(ticketId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${ticketId}`);
  }
}