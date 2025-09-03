import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../class/user';
import { SubscriptionLevel } from '../class/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/users';
  private authUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }
   getMe(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`);
  }
  createUser(body: { firstName: string; lastName: string; email: string; phone: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/signup`, body);
  }
  getAvatarBlob(id: number) {
  return this.http.get(`${this.apiUrl}/${id}/avatar`, { responseType: 'blob' });
  }

  uploadAvatar(id: number, file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post(`${this.apiUrl}/${id}/avatar`, form);
  }
  getMyAvatarBlob() {
    return this.http.get(`${this.apiUrl}/me/avatar`, { responseType: 'blob' });
  }

  uploadMyAvatar(file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post(`${this.apiUrl}/me/avatar`, form);
  }
  updateUser(id: number, user: Partial<User>): Observable<any> { 
    return this.http.put<any>(`${this.apiUrl}/${id}`, user);
  }
  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  setSubscription(
    userId: number,
    level: SubscriptionLevel,
    start: Date,
    end: Date | null
  ): Observable<User> {
    const user: Partial<User> = {
      subscriptionLevel: level,
      subscriptionStart: start,
      subscriptionEnd: end ?? undefined
    };

    return this.http.put<User>(`${this.apiUrl}/${userId}`, user);
  }
}
