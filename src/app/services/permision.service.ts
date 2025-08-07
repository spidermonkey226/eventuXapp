import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Permision } from '../class/permision';

@Injectable({
  providedIn: 'root'
})
export class PermisionService {
  private baseUrl = 'http://localhost:8080/api/permisions';

  constructor(private http: HttpClient) {}

  // Get all permissions
  getAll(): Observable<Permision[]> {
    return this.http.get<Permision[]>(this.baseUrl);
  }

  // Get a permission by ID
  getById(id: number): Observable<Permision> {
    return this.http.get<Permision>(`${this.baseUrl}/${id}`);
  }

  // Create a new permission
  create(permision: Permision): Observable<Permision> {
    return this.http.post<Permision>(this.baseUrl, permision);
  }

  // Delete a permission by ID
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}