// src/app/services/auth.service.ts
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, of, switchMap, tap } from 'rxjs';

const API = 'http://localhost:8080/api';
const TOKEN_KEY = 'token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // start as null; don't touch sessionStorage during field initialization
  private userSub = new BehaviorSubject<any | null>(null);
  user$ = this.userSub.asObservable();
  isLoggedIn$ = this.user$.pipe(map(u => !!u));

  constructor() {
    // only read storage in the browser
    if (this.isBrowser) {
      const raw = sessionStorage.getItem('loggedInUser');
      if (raw) {
        try { this.userSub.next(JSON.parse(raw)); } catch {}
      }
    }
  }

  private writeUser(user: any | null) {
    if (this.isBrowser) {
      if (user) sessionStorage.setItem('loggedInUser', JSON.stringify(user));
      else sessionStorage.removeItem('loggedInUser');
    }
    this.userSub.next(user);
  }

  private setToken(token: string | null) {
    if (!this.isBrowser) return;
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  }

  private getToken(): string | null {
    if (!this.isBrowser) return null;
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  }

  login(email: string, password: string) {
    // your backend returns { message, token, user }
    return this.http.post<{ message:string; token:string; user:any }>(`${API}/auth/signin`, { email, password })
      .pipe(
        tap(res => this.setToken(res.token)),
        tap(res => this.writeUser(res.user)),
        // optional sanity check using the token we just stored
        switchMap(() =>
          this.http.get<any>(`${API}/users/me`).pipe(
            tap(me => this.writeUser(me)),
            catchError(() => of(this.userSub.value)) // keep the user we already set
          )
        ),
        catchError(err => {
          this.logout();
          return of(null);
        })
      );
  }

  logout() {
    this.setToken(null);
    this.writeUser(null);
  }
}
