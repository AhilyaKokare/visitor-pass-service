import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TenantDashboardResponse } from '../models/dashboard.model';
import { UserDashboardStats } from '../models/home-dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getTenantDashboardData(tenantId: number): Observable<TenantDashboardResponse> {
    return this.http.get<TenantDashboardResponse>(`${this.apiUrl}/tenants/${tenantId}/admin/dashboard`);
  }

  getUserDashboardStats(): Observable<UserDashboardStats> {
    return this.http.get<UserDashboardStats>(`${this.apiUrl}/dashboard/user-stats`);
  }
}
