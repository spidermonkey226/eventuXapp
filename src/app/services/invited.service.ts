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

  // Get all invited entries
  getAll(): Observable<Invited[]> {
    return this.http.get<Invited[]>(this.baseUrl);
  }
 getByEventId(eventId: number): Observable<InvitedDTO[]> {
    return this.http.get<InvitedDTO[]>(`${this.baseUrl}?eventId=${eventId}`);
  }

  createInvite(eventId: number, email: string, firstName?: string) {
  return this.http.post(`${this.baseUrl}`, { eventId, email, firstName });
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
    create(req: InviteCreateRequest): Observable<InvitedDTO> {
    return this.http.post<InvitedDTO>(this.baseUrl, req);
  }
  //Update RSVP or other fields (optional method)
update(invited: { eventId: number; email: string; firstName?: string; note?: string }) {
  const url = `${this.baseUrl}/${invited.eventId}/${encodeURIComponent(invited.email)}`;
    // if you later add a PUT/PATCH endpoint; for now you can omit this
    return this.http.put<any>(url, { firstName: invited.firstName, note: invited.note });
}


  updateStatus(eventId: number, email: string, coming: boolean, note?: string): Observable<Invited> {
    const url = `${this.baseUrl}/${eventId}/${encodeURIComponent(email)}`;
    return this.http.patch<Invited>(url, { coming, note });
  }

  delete(eventId: number, email: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${eventId}/${encodeURIComponent(email)}`);
  }
}