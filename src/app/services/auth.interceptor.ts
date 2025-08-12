// src/app/services/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

const API_BASE = 'http://localhost:8080/api';
export const authInterceptor: HttpInterceptorFn = (req, next) => {
 const isApi = req.url.startsWith(API_BASE);
  const isAuthEndpoint = isApi && req.url.startsWith(`${API_BASE}/auth/`);

  if (!isApi || isAuthEndpoint) {
    return next(req);
  }

  let raw: string | null = null;
  try {
    raw = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  } catch { raw = null; }

  if (!raw) {
    // console.debug('[authInterceptor] No token found for', req.url);
    return next(req);
  }

  // Normalize token (remove accidental "Bearer " if already stored with it)
  const token = raw.startsWith('Bearer ') ? raw.slice(7) : raw;

  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });

  // console.debug('[authInterceptor] Attaching Authorization header to', req.url);
  return next(authReq);
};
