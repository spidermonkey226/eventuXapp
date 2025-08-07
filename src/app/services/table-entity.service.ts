import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TableEntity } from '../class/table-entity';

@Injectable({
  providedIn: 'root'
})
export class TableEntityService {
  private baseUrl = 'http://localhost:8080/api/tableentitys';

  constructor(private http: HttpClient) {}

  // Get all tables
  getAll(): Observable<TableEntity[]> {
    return this.http.get<TableEntity[]>(this.baseUrl);
  }

  // Get table by ID
  getById(id: number): Observable<TableEntity> {
    return this.http.get<TableEntity>(`${this.baseUrl}/${id}`);
  }

  // Create new table
  create(table: TableEntity): Observable<TableEntity> {
    return this.http.post<TableEntity>(this.baseUrl, table);
  }

  // Delete table by ID
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}