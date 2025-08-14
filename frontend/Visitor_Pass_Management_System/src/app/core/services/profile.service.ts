import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

// Profile management for any authenticated user
@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);

  me() {
    return this.http.get(`${environment.apiBaseUrl}/api/profile/me`);
  }

  update(dto: any) {
    return this.http.put(`${environment.apiBaseUrl}/api/profile/me`, dto);
  }
}