import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private baseUrl = 'http://localhost:8080/api/events';

  constructor(private http: HttpClient) {}

  // Get all events from the backend
  getAll(): Observable<Event[]> {
    return this.http.get<Event[]>(this.baseUrl);
  }

  // Get a single event by ID
  getById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.baseUrl}/${id}`);
  }

  // Create a new event
  create(event: Event): Observable<Event> {
    return this.http.post<Event>(this.baseUrl, event);
  }

  // Delete an event by ID
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}