import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../core/services/users.service';

// Tenant Admin dashboard - shows simple stats
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h4 class="mb-3">Tenant Admin Dashboard</h4>
    <div class="row g-3">
      <div class="col-md-4">
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <div class="text-muted">Users</div>
                <div class="h4">{{ dashboard?.usersCount ?? '-' }}</div>
              </div>
              <span class="badge text-bg-primary">Tenant</span>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="text-muted">Pending Passes</div>
            <div class="h4">{{ dashboard?.pendingPasses ?? '-' }}</div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="text-muted">Approved Today</div>
            <div class="h4">{{ dashboard?.approvedToday ?? '-' }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminDashboardComponent {
  private users = inject(UsersService);
  dashboard: any;

  ngOnInit() {
    this.users.adminDashboard().subscribe(res => this.dashboard = res);
  }
}