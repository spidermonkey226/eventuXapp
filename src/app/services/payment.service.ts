import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChargeRequest {
  planId: number;          // 0..4
  cardNumber: string;
  expiry: string;          // MM/YY
  cvv: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl = 'http://localhost:8080/api/payments';

  constructor(private http: HttpClient) {}

  charge(body: ChargeRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/charge`, body);
  }
}
