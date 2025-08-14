import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../core/services/users.service';

// Tenant Admin - manage users in the tenant
@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4>Users</h4>
      <button class="btn btn-primary" (click)="openCreate()">Create User</button>
    </div>

    <!-- List -->
    <div class="card shadow-sm mb-3">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-sm align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of usersList; let i = index">
                <td>{{ i + 1 }}</td>
                <td>{{ u.name }}</td>
                <td>{{ u.email }}</td>
                <td><span class="badge text-bg-secondary">{{ u.role }}</span></td>
                <td>
                  <span class="badge" [class.text-bg-success]="u.isActive" [class.text-bg-danger]="!u.isActive">
                    {{ u.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="text-end">
                  <button class="btn btn-outline-secondary btn-sm me-2" (click)="toggle(u)">
                    {{ u.isActive ? 'Deactivate' : 'Activate' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create form -->
    <div *ngIf="creating" class="card shadow-sm">
      <div class="card-body">
        <h5 class="mb-3">Create User</h5>
        <form (ngSubmit)="create()">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Name</label>
              <input class="form-control" [(ngModel)]="form.name" name="name" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Email</label>
              <input type="email" class="form-control" [(ngModel)]="form.email" name="email" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Password</label>
              <input type="password" class="form-control" [(ngModel)]="form.password" name="password" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Role</label>
              <select class="form-select" [(ngModel)]="form.role" name="role" required>
                <option value="ROLE_EMPLOYEE">Employee</option>
                <option value="ROLE_APPROVER">Approver</option>
                <option value="ROLE_SECURITY">Security</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Contact</label>
              <input class="form-control" [(ngModel)]="form.contact" name="contact" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Department</label>
              <input class="form-control" [(ngModel)]="form.department" name="department" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Gender</label>
              <select class="form-select" [(ngModel)]="form.gender" name="gender">
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Joining Date</label>
              <input type="date" class="form-control" [(ngModel)]="form.joiningDate" name="joiningDate" />
            </div>
            <div class="col-12">
              <label class="form-label">Address</label>
              <input class="form-control" [(ngModel)]="form.address" name="address" />
            </div>
          </div>
          <div class="mt-3 d-flex gap-2">
            <button class="btn btn-success">Create</button>
            <button type="button" class="btn btn-outline-secondary" (click)="creating=false">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class UsersComponent {
  private api = inject(UsersService);
  usersList: any[] = [];
  creating = false;
  form: any = { role: 'ROLE_EMPLOYEE' };

  ngOnInit() { this.load(); }

  load() { this.api.listUsers().subscribe((res: any) => this.usersList = res); }
  openCreate() { this.creating = true; }

  create() {
    this.api.createUser(this.form).subscribe(() => {
      this.creating = false; this.form = { role: 'ROLE_EMPLOYEE' }; this.load();
    });
  }

  toggle(u: any) {
    this.api.updateUserStatus(u.id, !u.isActive).subscribe(() => this.load());
  }
}