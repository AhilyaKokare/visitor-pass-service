import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // <-- IMPORT FormsModule
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { ConfirmationService } from '../../../core/services/confirmation.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  // Make sure FormsModule is imported here
  imports: [CommonModule, RouterModule, TitleCasePipe, LoadingSpinnerComponent, FormsModule],
  templateUrl: './user-list.component.html',
})
export class UserListComponent implements OnInit {
  // This gives us a way to programmatically click the modal's close button
  @ViewChild('closeModalButton') closeModalButton!: ElementRef;

  users: User[] = [];
  tenantId!: number;
  isLoading = true;
  isSubmitting = false;

  // This object will be bound to the form fields in the modal
  newUser: any = { role: 'ROLE_EMPLOYEE' };

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private toastr: ToastrService,
    private confirmationService: ConfirmationService
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
    this.userService.getUsers(this.tenantId).subscribe({
      next: data => {
        this.users = data;
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Failed to load users.');
        this.isLoading = false;
      }
    });
  }

  // This method is called when the modal form is submitted
  onCreateUser(): void {
    this.isSubmitting = true;
    this.userService.createUser(this.tenantId, this.newUser).subscribe({
      next: () => {
        this.toastr.success('User created successfully!');
        this.loadUsers(); // Refresh the user list
        this.closeModalButton.nativeElement.click(); // Programmatically close the modal
        this.newUser = { role: 'ROLE_EMPLOYEE' }; // Reset the form for the next creation
        this.isSubmitting = false;
      },
      error: (err) => {
        this.toastr.error(err.error.message || 'Failed to create user. The email may already be in use.');
        this.isSubmitting = false;
      }
    });
  }

  toggleUserStatus(user: User): void {
    const action = user.isActive ? 'Deactivate' : 'Activate';
    const confirmed = this.confirmationService.confirm(`Are you sure you want to ${action} the user "${user.name}"?`);

    if (confirmed) {
      this.userService.updateUserStatus(this.tenantId, user.id, !user.isActive).subscribe({
        next: () => {
          this.toastr.success(`User status updated successfully.`);
          this.loadUsers();
        },
        error: () => this.toastr.error('Failed to update user status.')
      });
    }
  }
}
