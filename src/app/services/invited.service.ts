import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invited } from '../class/invited';

export interface InviteCreateRequest {
  eventId: number;
  email: string;
  firstName?: string;
  note?: string;
}

export interface InvitedDTO {
  eventId: number;
  email: string;
  firstName?: string;
  coming?: boolean | null;
  note?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class InvitedService {
  private baseUrl = 'http://localhost:8080/api/inviteds';

  constructor(private http: HttpClient) {}

  // ✅ API returns DTO, so type it as DTO
  getAll(): Observable<InvitedDTO[]> {
    return this.http.get<InvitedDTO[]>(this.baseUrl);
  }
  update(invited: { eventId: number; email: string; firstName?: string; note?: string }) {
    const url = `${this.baseUrl}/${invited.eventId}/${encodeURIComponent(invited.email)}`;
    const body: any = {};
    if (invited.firstName !== undefined) body.firstName = invited.firstName;
    if (invited.note !== undefined) body.note = invited.note;
    // Backend returns a small DTO map {eventId,email,firstName,note}
    return this.http.put<{ eventId: number; email: string; firstName?: string; note?: string }>(url, body);
  }

  getByEventId(eventId: number): Observable<InvitedDTO[]> {
    return this.http.get<InvitedDTO[]>(`${this.baseUrl}?eventId=${eventId}`);
  }

  createInvite(eventId: number, email: string, firstName?: string) {
    return this.http.post<InvitedDTO>(`${this.baseUrl}`, { eventId, email, firstName });
  }

  // ✅ your backend returns InvitedDTO here too
  getById(eventId: number, email: string): Observable<InvitedDTO> {
    const url = `${this.baseUrl}/${eventId}/${encodeURIComponent(email)}`;
    return this.http.get<InvitedDTO>(url);
  }

  // (If you still use token endpoint elsewhere)
  getByToken(token: string) {
  const url = `${this.baseUrl}/by-token?token=${encodeURIComponent(token)}`;
  // Keep the return type as Invited to satisfy rsvp.component
  return this.http.get<Invited>(url);
}

  create(req: InviteCreateRequest): Observable<InvitedDTO> {
    return this.http.post<InvitedDTO>(this.baseUrl, req);
  }

  // ⚠️ Backend returns 204 No Content (Void). Don’t type as Invited/DTO.
  updateStatus(eventId: number, email: string, coming: boolean, note?: string): Observable<void> {
    const url = `${this.baseUrl}/${eventId}/${encodeURIComponent(email)}/status`;
    return this.http.put<void>(url, { coming, note });
  }

  delete(eventId: number, email: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${eventId}/${encodeURIComponent(email)}`);
  }
}