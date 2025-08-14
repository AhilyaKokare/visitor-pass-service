import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PassesService } from '../../core/services/passes.service';

// Employee - own pass history
@Component({
  selector: 'app-pass-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h4 class="mb-3">My Pass History</h4>
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
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of items; let i = index">
                <td>{{ i + 1 }}</td>
                <td>{{ p.visitorName }}</td>
                <td>{{ p.purpose }}</td>
                <td>{{ p.visitDateTime | date: 'medium' }}</td>
                <td><span class="badge text-bg-secondary">{{ p.status }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class PassHistoryComponent {
  private api = inject(PassesService);
  items: any[] = [];

  ngOnInit() {
    this.api.myHistory().subscribe((res: any) => this.items = res);
  }
}