import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

// Tenant Admin - user management endpoints
@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  listUsers() {
    const tenantId = this.auth.tenantId;
    return this.http.get(`${environment.apiBaseUrl}/api/tenants/${tenantId}/admin/users`);
  }

  createUser(dto: any) {
    const tenantId = this.auth.tenantId;
    return this.http.post(`${environment.apiBaseUrl}/api/tenants/${tenantId}/admin/users`, dto);
  }

  updateUserStatus(userId: number, isActive: boolean) {
    const tenantId = this.auth.tenantId;
    return this.http.put(`${environment.apiBaseUrl}/api/tenants/${tenantId}/admin/users/${userId}/status`, { isActive });
  }

  adminDashboard() {
    const tenantId = this.auth.tenantId;
    return this.http.get(`${environment.apiBaseUrl}/api/tenants/${tenantId}/admin/dashboard`);
  }
}