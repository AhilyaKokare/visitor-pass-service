import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

// Security guard functions: today dashboard, search by pass code, check-in/out
@Injectable({ providedIn: 'root' })
export class SecurityService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  todayDashboard() {
    const tenantId = this.auth.tenantId;
    return this.http.get(`${environment.apiBaseUrl}/api/tenants/${tenantId}/security/dashboard/today`);
  }

  searchByCode(passCode: string) {
    const tenantId = this.auth.tenantId;
    return this.http.get(`${environment.apiBaseUrl}/api/tenants/${tenantId}/security/passes/search`, { params: { passCode } });
  }

  checkIn(passId: number) {
    const tenantId = this.auth.tenantId;
    return this.http.post(`${environment.apiBaseUrl}/api/tenants/${tenantId}/security/check-in/${passId}`, {});
  }

  checkOut(passId: number) {
    const tenantId = this.auth.tenantId;
    return this.http.post(`${environment.apiBaseUrl}/api/tenants/${tenantId}/security/check-out/${passId}`, {});
  }
}