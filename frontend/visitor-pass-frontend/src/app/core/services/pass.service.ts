import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VisitorPass, EmailNotificationRequest, EmailNotificationResponse } from '../models/pass.model';
import { Page } from '../../shared/pagination/pagination.component';

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

  getMyPassHistory(tenantId: number, page: number, size: number): Observable<Page<VisitorPass>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<VisitorPass>>(`${this.getApiUrl(tenantId)}/passes/history`, { params });
  }

  getPassesForTenant(tenantId: number, page: number, size: number): Observable<Page<VisitorPass>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<VisitorPass>>(`${this.getApiUrl(tenantId)}/passes`, { params });
  }

  approvePass(tenantId: number, passId: number): Observable<any> {
    return this.http.post(`${this.getApiUrl(tenantId)}/approvals/${passId}/approve`, {});
  }

  rejectPass(tenantId: number, passId: number, reason: string): Observable<any> {
    return this.http.post(`${this.getApiUrl(tenantId)}/approvals/${passId}/reject`, { reason });
  }

  // Email notification methods
  sendPassCreatedEmail(tenantId: number, emailRequest: EmailNotificationRequest): Observable<EmailNotificationResponse> {
    return this.http.post<EmailNotificationResponse>(`${this.getApiUrl(tenantId)}/passes/send-email`, emailRequest);
  }

  sendPassApprovedEmail(tenantId: number, passId: number, visitorEmail: string): Observable<EmailNotificationResponse> {
    const emailRequest: EmailNotificationRequest = {
      passId,
      visitorEmail,
      emailType: 'PASS_APPROVED'
    };
    return this.http.post<EmailNotificationResponse>(`${this.getApiUrl(tenantId)}/passes/send-email`, emailRequest);
  }

  sendPassRejectedEmail(tenantId: number, passId: number, visitorEmail: string): Observable<EmailNotificationResponse> {
    const emailRequest: EmailNotificationRequest = {
      passId,
      visitorEmail,
      emailType: 'PASS_REJECTED'
    };
    return this.http.post<EmailNotificationResponse>(`${this.getApiUrl(tenantId)}/passes/send-email`, emailRequest);
  }
}
