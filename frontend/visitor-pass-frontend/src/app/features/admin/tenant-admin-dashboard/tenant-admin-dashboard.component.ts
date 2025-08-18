import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-tenant-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
    templateUrl: './tenant-admin-dashboard.component.html',
})
export class TenantAdminDashboardComponent implements OnInit {
  @ViewChild('closeModalButton') closeModalButton!: ElementRef;

  users: User[] = [];
  tenantId!: number;
  newUser: any = { role: 'ROLE_EMPLOYEE' };

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getDecodedToken();
    if (user && user.tenantId) {
      this.tenantId = user.tenantId;
      this.loadUsers();
    }
  }

  loadUsers(): void {
    this.userService.getUsers(this.tenantId).subscribe(data => {
      this.users = data;
    });
  }

  onCreateUser(): void {
    this.userService.createUser(this.tenantId, this.newUser).subscribe({
      next: () => {
        this.toastr.success('User created successfully!');
        this.loadUsers();
        this.closeModalButton.nativeElement.click(); // Close the modal
        this.newUser = { role: 'ROLE_EMPLOYEE' }; // Reset form
      },
      error: (err) => this.toastr.error(err.error.message || 'Failed to create user.')
    });
  }

  toggleUserStatus(user: User): void {
    this.userService.updateUserStatus(this.tenantId, user.id, !user.isActive).subscribe({
      next: () => {
        this.toastr.success(`User status updated to ${!user.isActive ? 'Active' : 'Inactive'}.`);
        this.loadUsers();
      },
      error: (err) => this.toastr.error('Failed to update user status.')
    });
  }
}
