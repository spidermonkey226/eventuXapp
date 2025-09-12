import { Injectable,inject} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event } from '@angular/router';

const API = 'http://localhost:8080/api';

export interface AddEventPayload {
  eventName: string;
  email: string;
  phone: string;

  date: string;          // yyyy-MM-dd
  people: number;
  eventCategory: string; // must match your backend enum value

  streetName: string;
  streetNumber: string;
  postCode: string;
  city: string;          // must match your backend City enum value

  comments: string;

  hasManager: boolean;
  managerName?: string;
  managerEmail?: string;
  managerPhone?: string;
}

export interface EventSummary {
  eventID: number;
  eventName: string;
  eventCatgory: string;
  eventDate: string;
  expectedPeople: number;
  comments?: string;
}
export interface UserRef {
  id: number;
  firstName?: string;
  lastName?: string;
  email: string;
}
export interface EventItem {
  eventID: number;
  eventName: string;
  eventCatgory: string;
  eventDate: string;
  expectedPeople: number;
  comments?: string;
  host: UserRef;
  manager: UserRef;
  address?: {
    streetName?: string;
    streetNumber?: string;
    postCode?: string;
    city?: string;
  };
}
export interface EventDetail {
  eventID?: number;   // normalize id names
  eventId?: number;
  id?: number;
  eventName?: string;
  eventCatgory?: string;
  eventDate?: string; // yyyy-MM-dd
  expectedPeople?: number;
  comments?: string;
  address?: {
    streetName?: string;
    streetNumber?: string;
    postCode?: string;
    city?: string;
  };
  host?: UserRef;
  manager?: UserRef;
}

@Injectable({ providedIn: 'root' })
export class EventService {
  private http = inject(HttpClient);

   getAll(): Observable<EventItem[]> {
    return this.http.get<EventItem[]>(`${API}/events`);
  }

  getMine(): Observable<EventItem[]> {
    return this.http.get<EventItem[]>(`${API}/events/mine`);
  }
  getById(id: number): Observable<EventDetail> {
    return this.http.get<EventDetail>(`${API}/events/${id}`);
  }

  create(body: AddEventPayload): Observable<any> {
    return this.http.post(`${API}/events`, body);
  }
  getFiles(eventId: number) {
    return this.http.get<{id:number; name:string; size:string; type:string; uploader:{id:number|null; email:string|null}}[]>(
      `${API}/events/${eventId}/files`
    );
  }
  getFilesMine(eventId: number) {
  return this.http.get<{id:number; name:string; size?:string; type?:string}[]>(
    `${API}/events/${eventId}/files/mine`
  );
}

  uploadFiles(eventId: number, files: File[]) {
  const form = new FormData();
  files.forEach(f => form.append('files', f)); 

  return this.http.post<{ id:number; name:string }[]>(
    `${API}/events/${eventId}/files`,
    form
  );
}

  deleteFile(eventId: number, fileId: number) {
  return this.http.delete<void>(`${API}/events/${eventId}/files/${fileId}`);
}
downloadFile(eventId: number, fileId: number) {
  return this.http.get(`${API}/events/${eventId}/files/${fileId}/download`, { responseType: 'blob' });
}
renameFile(eventId: number, fileId: number, name: string) {
  return this.http.patch<{id:number; name:string}>(`${API}/events/${eventId}/files/${fileId}`, { name });
}
update(id: number, body: Partial<AddEventPayload>): Observable<any> {
  return this.http.put(`${API}/events/${id}`, body);
}
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/events/${id}`);
  }
}