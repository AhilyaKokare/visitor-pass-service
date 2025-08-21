import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
  @ViewChild('closeModalButton') closeModalButton!: ElementRef;

  userPage: Page<User> | null = null;
  tenantId!: number;
  isLoading = true;
  isSubmitting = false;
  showPassword = false;

  currentPage = 0;
  pageSize = 10;

  newUser: any = {
    name: '',
    email: '',
    password: '',
    role: 'ROLE_EMPLOYEE',
    department: '',
    joiningDate: '',
    gender: '',
    contact: '',
    address: ''
  };

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
    this.userService.getUsers(this.tenantId, this.currentPage, this.pageSize).subscribe({
      next: data => {
        this.userPage = data;
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

  onCreateUser(): void {
    console.log('Form submission started');
    console.log('Current newUser data:', this.newUser);

    if (!this.validateForm()) {
      console.log('Form validation failed');
      return;
    }

    console.log('Form validation passed, submitting to API');
    this.isSubmitting = true;

    this.userService.createUser(this.tenantId, this.newUser).subscribe({
      next: (response) => {
        console.log('User created successfully:', response);
        this.toastr.success('User created successfully!', 'Success');
        this.loadUsers();
        this.closeModalButton.nativeElement.click();
        this.resetForm();
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Error creating user:', err);
        this.toastr.error(err.error?.message || 'Failed to create user.', 'Error');
        this.isSubmitting = false;
      }
    });
  }

  private validateForm(): boolean {
    if (!this.newUser.name || !this.newUser.email || !this.newUser.password || !this.newUser.role || !this.newUser.joiningDate) {
      this.toastr.warning('Please fill in all required fields.', 'Validation Error');
      return false;
    }

    if (this.newUser.password.length < 8) {
      this.toastr.warning('Password must be at least 8 characters long.', 'Validation Error');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.newUser.email)) {
      this.toastr.warning('Please enter a valid email address.', 'Validation Error');
      return false;
    }

    return true;
  }

  resetForm(): void {
    this.newUser = {
      role: 'ROLE_EMPLOYEE',
      name: '',
      email: '',
      password: '',
      department: '',
      joiningDate: '',
      gender: '',
      contact: '',
      address: ''
    };
    this.showPassword = false;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Debug method to test input binding
  onInputChange(field: string, value: any): void {
    console.log(`Input changed - ${field}:`, value);
    console.log('Current newUser object:', this.newUser);
  }

  // Test method to verify form data
  testFormData(): void {
    console.log('=== FORM DATA TEST ===');
    console.log('newUser object:', JSON.stringify(this.newUser, null, 2));
    console.log('Form valid:', this.validateForm());
    alert('Check console for form data. Current name: ' + (this.newUser.name || 'No name entered'));
  }

  toggleUserStatus(user: User): void {
    const action = user.isActive ? 'Deactivate' : 'Activate';
    if (this.confirmationService.confirm(`Are you sure you want to ${action} user "${user.name}"?`)) {
      this.userService.updateUserStatus(this.tenantId, user.id, !user.isActive).subscribe({
        next: () => {
          this.toastr.success(`User status updated.`);
          this.loadUsers();
        },
        error: () => this.toastr.error('Failed to update user status.')
      });
    }
  }
}
