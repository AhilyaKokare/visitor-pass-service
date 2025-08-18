import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VisitorPass } from '../models/pass.model';

@Injectable({
  providedIn: 'root'
})
export class PassService {
  private getApiUrl(tenantId: number) {
    return `${environment.apiUrl}/tenants/${tenantId}`;
  }

  constructor(private http: HttpClient) { }

  createPass(tenantId: number, passData: any): Observable<VisitorPass> {
    return this.http.post<VisitorPass>(`${this.getApiUrl(tenantId)}/passes`, passData);
  }

  getMyPassHistory(tenantId: number): Observable<VisitorPass[]> {
    return this.http.get<VisitorPass[]>(`${this.getApiUrl(tenantId)}/passes/history`);
  }

  getPendingPasses(tenantId: number): Observable<VisitorPass[]> {
    return this.http.get<VisitorPass[]>(`${this.getApiUrl(tenantId)}/passes`);
  }

  approvePass(tenantId: number, passId: number): Observable<any> {
    return this.http.post(`${this.getApiUrl(tenantId)}/approvals/${passId}/approve`, {});
  }

  rejectPass(tenantId: number, passId: number, reason: string): Observable<any> {
    return this.http.post(`${this.getApiUrl(tenantId)}/approvals/${passId}/reject`, { reason });
  }
}
