import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Intercepts all HTTP requests to add Authorization header and handle 401/403 globally
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
    const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
    return next.handle(authReq).pipe(
      catchError((err: HttpErrorResponse) => {
        // If unauthorized/forbidden, redirect to login in a real app
        if (err.status === 401 || err.status === 403) {
          // simple handling for now
          console.warn('Unauthorized/Forbidden. Please login again.');
        }
        return throwError(() => err);
      })
    );
  }
}