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
  getById( eventId: number, email: string ): Observable<Invited> {
    const url = `${this.baseUrl}/${eventId}/${encodeURIComponent(email)}`;
    return this.http.get<Invited>(url);
  }
  getByToken(token:string):Observable<Invited>{
    const url = `${this.baseUrl}/token/${encodeURIComponent(token)}`;
    return this.http.get<Invited>(url);
  }
  // Create a new invited entry
  create(invited: Invited): Observable<Invited> {
    return this.http.post<Invited>(this.baseUrl, invited);
  }
  //Update RSVP or other fields (optional method)
  update(invited: Invited): Observable<Invited> {
    const url = `${this.baseUrl}/${invited.id.eventId}/${encodeURIComponent(invited.id.email)}`;
    return this.http.put<Invited>(url, invited);
  }
  updateStatus(eventId: number, email: string, coming: boolean, note?: string): Observable<Invited> {
    const url = `${this.baseUrl}/${eventId}/${encodeURIComponent(email)}`;
    return this.http.patch<Invited>(url, { coming, note });
  }
  // Delete invited by composite ID (eventId + email)
  delete( eventId: number, email: string ): Observable<void> {
    const url = `${this.baseUrl}/${eventId}/${encodeURIComponent(email)}`;
    return this.http.delete<void>(url);
  }
}