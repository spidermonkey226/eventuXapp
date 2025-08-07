import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Files } from '../class/files';

@Injectable({
  providedIn: 'root'
})
export class FilesService {
  private baseUrl = 'http://localhost:8080/api/filess';

  constructor(private http: HttpClient) {}

  // Get all files from the backend
  getAll(): Observable<Files[]> {
    return this.http.get<Files[]>(this.baseUrl);
  }

  // Get a single file by ID
  getById(id: number): Observable<Files> {
    return this.http.get<Files>(`${this.baseUrl}/${id}`);
  }

  // Create a new file entry
  create(file: Files): Observable<Files> {
    return this.http.post<Files>(this.baseUrl, file);
  }

  // Delete a file by ID
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}