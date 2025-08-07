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

  // Get a ticket by ID
  getById(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.baseUrl}/${id}`);
  }

  // Create a new ticket
  create(ticket: Ticket): Observable<Ticket> {
    return this.http.post<Ticket>(this.baseUrl, ticket);
  }

  // Delete a ticket by ID
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}