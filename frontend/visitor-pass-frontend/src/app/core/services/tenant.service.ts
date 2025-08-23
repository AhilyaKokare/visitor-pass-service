import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TenantDashboardInfo, SuperAdminDashboard } from '../models/tenant.model';

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private apiUrl = `${environment.apiUrl}/super-admin`;

  constructor(private http: HttpClient) { }

  getSuperAdminDashboard(): Observable<SuperAdminDashboard> {
    return this.http.get<SuperAdminDashboard>(`${this.apiUrl}/dashboard`);
  }

  createTenantAndAdmin(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/tenants`, data);
  }

  getPaginatedLocations(page: number = 0, size: number = 10): Observable<any> {
    // Add cache-busting parameter to ensure fresh data
    const timestamp = new Date().getTime();
    return this.http.get<any>(`${this.apiUrl}/locations?page=${page}&size=${size}&_t=${timestamp}`);
  }

  deleteLocationAdmin(tenantId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/locations/${tenantId}/admin`);
  }

  createLocationAdmin(tenantId: number, adminData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/locations/${tenantId}/admin`, adminData);
  }
}
