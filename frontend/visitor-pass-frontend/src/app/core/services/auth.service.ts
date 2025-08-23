import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { AuthResponse } from '../models/auth-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject: BehaviorSubject<any | null>;

  constructor(private http: HttpClient, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<any | null>(this.getDecodedToken());
  }

  login(credentials: any): Observable<AuthResponse> {
    console.log('🔐 AuthService.login called with:', {
      url: `${this.apiUrl}/login`,
      credentials: { username: credentials.username, password: '***hidden***' }
    });

    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        console.log('✅ Login response received:', response);
        if (response && response.accessToken) {
          console.log('💾 Storing token in localStorage');
          localStorage.setItem('token', response.accessToken);
          const decodedToken = this.getDecodedToken();
          console.log('🔓 Decoded token:', decodedToken);
          this.currentUserSubject.next(decodedToken);
        } else {
          console.error('❌ Invalid response format:', response);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    // Check if token is expired
    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        // Token is expired, remove it
        localStorage.removeItem('token');
        this.currentUserSubject.next(null);
        return false;
      }
      return true;
    } catch (error) {
      // Invalid token
      localStorage.removeItem('token');
      this.currentUserSubject.next(null);
      return false;
    }
  }

  getDecodedToken(): any | null {
    const token = this.getToken();
    if (token) {
      try {
        return jwtDecode(token);
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  getCurrentUser() {
    return this.currentUserSubject.asObservable();
  }

<<<<<<< HEAD
  // Forgot Password Functionality
  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reset-password`, {
      token,
      newPassword
    });
=======
  forgotPassword(request: { email: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, request, { responseType: 'text' });
  }

  resetPassword(request: { token: string; newPassword: string; confirmPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, request, { responseType: 'text' });
>>>>>>> e594372 (Updated UI)
  }
}
