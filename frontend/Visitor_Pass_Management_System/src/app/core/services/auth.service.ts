import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { JwtPayload, LoginRequest, LoginResponse } from '../models/auth.models';

// Small helper to decode JWT payload safely without external deps
function decodeJwt<T = any>(token: string): T | null {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  // Perform login and persist token + claims
  login(req: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiBaseUrl}/api/auth/login`, req).pipe(
      tap(({ token }) => {
        localStorage.setItem('token', token);
        const payload = decodeJwt<JwtPayload>(token);
        if (payload) {
          const tenantId = payload.tenantId ?? payload.tenant_id ?? null;
          if (tenantId !== null) localStorage.setItem('tenantId', String(tenantId));
          if (payload.role) localStorage.setItem('role', payload.role);
          if (payload.userId) localStorage.setItem('userId', String(payload.userId));
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('tenantId');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
  }

  get token(): string | null { return localStorage.getItem('token'); }
  get tenantId(): number | null {
    const val = localStorage.getItem('tenantId');
    return val ? Number(val) : null;
  }
  get role(): string | null { return localStorage.getItem('role'); }
  get isAuthenticated(): boolean { return !!this.token; }
}