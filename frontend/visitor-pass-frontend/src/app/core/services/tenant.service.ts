import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TenantDashboardInfo } from '../models/tenant.model';

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private apiUrl = `${environment.apiUrl}/super-admin`;

  constructor(private http: HttpClient) { }

  getTenants(): Observable<TenantDashboardInfo[]> {
    return this.http.get<TenantDashboardInfo[]>(`${this.apiUrl}/dashboard/tenants`);
  }

  createTenantAndAdmin(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/tenants`, data);
  }
}
