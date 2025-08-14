import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

// Employee and Approver flows around passes
@Injectable({ providedIn: 'root' })
export class PassesService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  createPass(dto: { visitorName: string; visitorPhone: string; purpose: string; visitDateTime: string; }) {
    const tenantId = this.auth.tenantId;
    return this.http.post(`${environment.apiBaseUrl}/api/tenants/${tenantId}/passes`, dto);
  }

  myHistory() {
    const tenantId = this.auth.tenantId;
    return this.http.get(`${environment.apiBaseUrl}/api/tenants/${tenantId}/passes/history`);
  }

  approve(passId: number) {
    const tenantId = this.auth.tenantId;
    return this.http.post(`${environment.apiBaseUrl}/api/tenants/${tenantId}/approvals/${passId}/approve`, {});
  }
}