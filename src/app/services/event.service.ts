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

@Injectable({ providedIn: 'root' })
export class EventService {
  private http = inject(HttpClient);

  getAll(): Observable<EventSummary[]> {
    return this.http.get<EventSummary[]>(`${API}/events`);
  }

  getById(id: number): Observable<EventSummary> {
    return this.http.get<EventSummary>(`${API}/events/${id}`);
  }

  create(body: AddEventPayload): Observable<any> {
    return this.http.post(`${API}/events`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/events/${id}`);
  }
}