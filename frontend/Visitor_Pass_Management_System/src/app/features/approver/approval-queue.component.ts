import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PassesService } from '../../core/services/passes.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';

// Approver - simple queue + approve action
@Component({
  selector: 'app-approval-queue',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h4 class="mb-3">Approval Queue</h4>
    <div class="card shadow-sm">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-sm align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Visitor</th>
                <th>Purpose</th>
                <th>Date/Time</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of items; let i = index">
                <td>{{ i + 1 }}</td>
                <td>{{ p.visitorName }}</td>
                <td>{{ p.purpose }}</td>
                <td>{{ p.visitDateTime | date: 'medium' }}</td>
                <td class="text-end">
                  <button class="btn btn-success btn-sm" (click)="approve(p.id)">Approve</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class ApprovalQueueComponent {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  items: any[] = [];

  ngOnInit() { this.load(); }

  // Load pending approvals for current tenant
  load() {
    const tenantId = this.auth.tenantId;
    this.http.get(`${environment.apiBaseUrl}/api/tenants/${tenantId}/approvals/pending`).subscribe((res: any) => this.items = res);
  }

  approve(id: number) {
    const tenantId = this.auth.tenantId;
    this.http.post(`${environment.apiBaseUrl}/api/tenants/${tenantId}/approvals/${id}/approve`, {}).subscribe(() => this.load());
  }
}