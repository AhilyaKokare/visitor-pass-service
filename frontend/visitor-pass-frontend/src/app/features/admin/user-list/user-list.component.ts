// 1. IMPORT NgZone and other necessary modules
import { Component, OnInit, NgZone, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { Page, PaginationComponent } from '../../../shared/pagination/pagination.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TitleCasePipe, LoadingSpinnerComponent, FormsModule, PaginationComponent],
  templateUrl: './user-list.component.html',
})
export class UserListComponent implements OnInit {

  // --- RESTORED @ViewChild ---
  @ViewChild('closeModalButton') closeModalButton!: ElementRef;

  users: User[] = [];
  userPageDetails: Page<any> | null = null;
  tenantId!: number;
  isLoading = true;
  isSubmitting = false;
  currentPage = 0;
  pageSize = 10;
  newUser: any = { role: 'ROLE_EMPLOYEE' };

  // 2. INJECT NgZone
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private toastr: ToastrService,
    private confirmationService: ConfirmationService,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    const user = this.authService.getDecodedToken();
    if (user && user.tenantId) {
      this.tenantId = user.tenantId;
      this.loadUsers();
    }
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers(this.tenantId, this.currentPage, this.pageSize).subscribe({
      next: data => {
        this.users = data.content;
        this.userPageDetails = data;
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Failed to load users.');
        this.isLoading = false;
      }
    });
  }

  onPageChange(pageNumber: number): void {
    this.currentPage = pageNumber;
    this.loadUsers();
  }

  // --- RESTORED onCreateUser METHOD ---
  onCreateUser(): void {
    this.isSubmitting = true;
    this.userService.createUser(this.tenantId, this.newUser).subscribe({
      next: () => {
        this.toastr.success('User created successfully!');
        this.loadUsers(); // Reload the list to show the new user
        this.closeModalButton.nativeElement.click(); // Close the modal
        this.newUser = { role: 'ROLE_EMPLOYEE' }; // Reset the form
        this.isSubmitting = false;
      },
      error: (err) => {
        this.toastr.error(err.error.message || 'Failed to create user.');
        this.isSubmitting = false;
      }
    });
  }

  toggleUserStatus(userToToggle: User): void {
    const action = userToToggle.isActive ? 'Deactivate' : 'Activate';
    const newStatus = !userToToggle.isActive;

    if (this.confirmationService.confirm(`Are you sure you want to ${action} user "${userToToggle.name}"?`)) {
      this.userService.updateUserStatus(this.tenantId, userToToggle.id, newStatus).subscribe({
        next: (updatedUserFromServer) => {
          
          // 3. WRAP the UI update logic inside zone.run()
          this.zone.run(() => {
            this.toastr.success(`User has been ${action.toLowerCase()}d.`);
            
            const index = this.users.findIndex(u => u.id === updatedUserFromServer.id);
            if (index !== -1) {
              const newUsers = [...this.users];
              newUsers[index] = updatedUserFromServer;
              this.users = newUsers; 
            } else {
              this.loadUsers(); // Fallback
            }
          });
        },
        error: (err) => {
          this.toastr.error(err?.error?.message || 'Failed to update user status.');
        }
      });
    }
  }
}