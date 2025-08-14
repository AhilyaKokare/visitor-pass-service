import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SecurityService } from '../../core/services/security.service';

// Security - shows today's approved visitors, search & check-in/out
@Component({
  selector: 'app-security-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h4 class="mb-3">Security Dashboard</h4>

    <div class="card shadow-sm mb-3">
      <div class="card-body d-flex gap-2 align-items-end">
        <div>
          <label class="form-label">Search by Pass Code</label>
          <input class="form-control" [(ngModel)]="passCode" placeholder="e.g., FF0CB07A" />
        </div>
        <button class="btn btn-outline-primary" (click)="search()">Search</button>
      </div>
    </div>

    <div *ngIf="found" class="alert alert-info d-flex justify-content-between align-items-center">
      <div>
        <strong>{{ found.visitorName }}</strong> — {{ found.purpose }} on {{ found.visitDateTime | date:'medium' }}
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-success btn-sm" (click)="checkIn(found.id)">Check-In</button>
        <button class="btn btn-secondary btn-sm" (click)="checkOut(found.id)">Check-Out</button>
      </div>
    </div>

    <div class="card shadow-sm">
      <div class="card-body">
        <h6 class="mb-3">Approved Today</h6>
        <div class="table-responsive">
          <table class="table table-sm align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Visitor</th>
                <th>Purpose</th>
                <th>Date/Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of items; let i = index">
                <td>{{ i + 1 }}</td>
                <td>{{ p.visitorName }}</td>
                <td>{{ p.purpose }}</td>
                <td>{{ p.visitDateTime | date: 'short' }}</td>
                <td><span class="badge text-bg-secondary">{{ p.status }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class SecurityDashboardComponent {
  private api = inject(SecurityService);
  items: any[] = [];
  passCode = '';
  found: any = null;

  ngOnInit() { this.load(); }

  load() {
    this.api.todayDashboard().subscribe((res: any) => this.items = res);
  }

  search() {
    this.api.searchByCode(this.passCode).subscribe((res: any) => this.found = res);
  }

  checkIn(id: number) {
    this.api.checkIn(id).subscribe(() => this.load());
  }

  checkOut(id: number) {
    this.api.checkOut(id).subscribe(() => this.load());
  }
}