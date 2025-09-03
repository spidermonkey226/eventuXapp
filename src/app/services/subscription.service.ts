import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subscription } from '../class/subscription';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
 private baseUrl = 'http://localhost:8080/api/subscriptions';

  constructor(private http: HttpClient) {}

  // Get all subscriptions
  getAll(): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(this.baseUrl);
  }

  // Get a subscription by ID
  getById(id: number): Observable<Subscription> {
    return this.http.get<Subscription>(`${this.baseUrl}/${id}`);
  }

  // Create a new subscription
  create(subscription: Subscription): Observable<Subscription> {
    return this.http.post<Subscription>(this.baseUrl, subscription);
  }

  // Delete a subscription by ID
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
  // Update a subscription by ID
  update(subscription: Subscription): Observable<Subscription> {
    return this.http.put<Subscription>(`${this.baseUrl}/${subscription.id}`, subscription);
  }
}
