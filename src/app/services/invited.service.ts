import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invited } from '../class/invited';

@Injectable({
  providedIn: 'root'
})
export class InvitedService {
  private baseUrl = 'http://localhost:8080/api/inviteds';

  constructor(private http: HttpClient) {}

  // Get all invited entries
  getAll(): Observable<Invited[]> {
    return this.http.get<Invited[]>(this.baseUrl);
  }

  // Get invited by composite ID (eventId + email)
  getById(id: { eventId: number; email: string }): Observable<Invited> {
    const url = `${this.baseUrl}/${id.eventId}/${encodeURIComponent(id.email)}`;
    return this.http.get<Invited>(url);
  }

  // Create a new invited entry
  create(invited: Invited): Observable<Invited> {
    return this.http.post<Invited>(this.baseUrl, invited);
  }

  // Delete invited by composite ID (eventId + email)
  delete(id: { eventId: number; email: string }): Observable<void> {
    const url = `${this.baseUrl}/${id.eventId}/${encodeURIComponent(id.email)}`;
    return this.http.delete<void>(url);
  }
}