import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Address } from '../class/address';

@Injectable({
  providedIn: 'root'
})
export class AddressService {

 private baseUrl = 'http://localhost:8080/api/addresses';

  constructor(private http: HttpClient) {}

  // Get all addresses from the backend
  getAll(): Observable<Address[]> {
    return this.http.get<Address[]>(this.baseUrl);
  }

  // Get a single address by ID
  getById(id: number): Observable<Address> {
    return this.http.get<Address>(`${this.baseUrl}/${id}`);
  }

  // Create a new address
  create(address: Address): Observable<Address> {
    return this.http.post<Address>(this.baseUrl, address);
  }

  // Delete an address by ID
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
