// src/app/services/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  let token: string | null = null;

  try {
    // works in browser; SSR will throw if we touch window — hence try/catch
    token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  } catch {
    token = null;
  }

  if (!token) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
