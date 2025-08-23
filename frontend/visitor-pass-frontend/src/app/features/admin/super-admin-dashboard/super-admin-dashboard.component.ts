import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { TenantService } from '../../../core/services/tenant.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SuperAdminDashboard } from '../../../core/models/tenant.model';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './super-admin-dashboard.component.html',
  styleUrls: ['./super-admin-dashboard.component.scss'] // Use .scss
})
export class SuperAdminDashboardComponent implements OnInit {
  // ViewChild allows us to get a reference to the modal's close button in the HTML
  @ViewChild('closeModalButton') closeModalButton!: ElementRef;

  dashboardData: SuperAdminDashboard | null = null;
  paginatedLocations: any = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 10, first: true, last: true };
  isLoading = true;
  isSubmitting = false;
  isLoadingPage = false; // New loading state for pagination
  currentPage = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 20, 50]; // Page size options

  // This object will be bound to the form fields in the modal
  newTenantData: any = {};
  creatorName: string = '';

  // Expose Math to template
  Math = Math;

  // New admin creation after deletion
  showCreateAdminModal = false;
  deletedLocationInfo: any = null;
  newAdminData: any = {
    name: '',
    email: '',
    password: '',
    contact: ''
  };

  constructor(
    private tenantService: TenantService,
    private toastr: ToastrService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    console.log('=== SUPER ADMIN DASHBOARD INIT ===');

    // Check authentication first
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      this.toastr.error('Authentication required. Please login again.');
      this.authService.logout();
      return;
    }

    const user = this.authService.getDecodedToken();
    console.log('Decoded user:', user);

    if (!user) {
      console.error('Invalid token');
      this.toastr.error('Invalid authentication token. Please login again.');
      this.authService.logout();
      return;
    }

    // Check if user has SUPER_ADMIN role (handle both single role and roles array)
    const userRoles = user.roles || [];
    const userRole = user.role || '';
    console.log('User roles array:', userRoles);
    console.log('User single role:', userRole);

    const isSuperAdmin = userRoles.includes('ROLE_SUPER_ADMIN') || userRole === 'ROLE_SUPER_ADMIN';
    console.log('Is Super Admin:', isSuperAdmin);

    if (!isSuperAdmin) {
      console.error('User does not have SUPER_ADMIN role');
      this.toastr.error('Access denied. Super Admin privileges required.');
      return;
    }

    // Check token expiration
    const currentTime = Date.now() / 1000;
    if (user.exp < currentTime) {
      console.error('Token has expired');
      this.toastr.error('Your session has expired. Please login again.');
      this.authService.logout();
      return;
    }

    console.log('Authentication checks passed');
    console.log('Token expires at:', new Date(user.exp * 1000));

    if (user && user.sub) {
        // Get the creator's name (email) for auditing purposes
        this.creatorName = user.sub;
    }

    this.loadDashboard();
    this.loadLocations();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.tenantService.getSuperAdminDashboard().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Failed to load dashboard analytics.');
        this.isLoading = false;
      }
    });
  }

  // VVV THIS IS THE MISSING METHOD VVV
  /**
   * Called when the "Create New Tenant" modal form is submitted.
   */
  onCreateTenant(): void {
    this.isSubmitting = true;
    this.tenantService.createTenantAndAdmin(this.newTenantData).subscribe({
      next: (response) => {
        console.log('✅ TENANT CREATION SUCCESS:', response);
        console.log('Created tenant name:', this.newTenantData.tenantName);

        this.toastr.success(
          `🎉 Location "${this.newTenantData.tenantName}" created successfully!\n` +
          `📧 Comprehensive welcome email with login credentials sent to ${this.newTenantData.adminEmail}\n` +
          `👤 Admin account activated for ${this.newTenantData.adminName}`,
          '🏢 Location & Admin Created',
          {
            timeOut: 8000,
            enableHtml: true,
            closeButton: true
          }
        );
        // Reset pagination to first page to ensure new tenant is visible
        this.currentPage = 0;
        console.log('🔄 Refreshing data after tenant creation...');

        // Add a small delay to ensure database transaction is committed
        setTimeout(() => {
          this.loadDashboard(); // Refresh the dashboard data to show the new tenant
          this.loadLocations(); // Refresh the locations list to show the new tenant
        }, 500);

        this.closeModalButton.nativeElement.click(); // Programmatically close the modal
        this.newTenantData = {}; // Reset the form object for the next use
        this.isSubmitting = false;
      },
      error: (err) => {
        // Safely extract error message
        let errorMessage = 'Failed to create tenant.';

        if (err.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (err.status === 403) {
          errorMessage = 'Access denied. You may not have permission to create tenants.';
        } else if (err.error) {
          if (typeof err.error === 'string') {
            errorMessage = err.error;
          } else if (err.error.message) {
            errorMessage = err.error.message;
          } else if (err.error.error) {
            errorMessage = err.error.error;
          }
        } else if (err.message) {
          errorMessage = err.message;
        }

        this.toastr.error(errorMessage, 'Tenant Creation Failed', { timeOut: 5000 });
        this.isSubmitting = false;
      }
    });
  }

  loadLocations(): void {
    console.log('=== LOADING LOCATIONS ===');
    console.log('Current page:', this.currentPage);
    console.log('Page size:', this.pageSize);

    this.isLoadingPage = true; // Set loading state

    this.tenantService.getPaginatedLocations(this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        console.log('Locations loaded successfully:', data);
        console.log('Number of locations:', data.content?.length || 0);
        console.log('Total elements:', data.totalElements);
        console.log('Current page:', data.number);
        console.log('Total pages:', data.totalPages);

        // Log each location's name for debugging
        if (data.content && data.content.length > 0) {
          console.log('Location names:');
          data.content.forEach((location: any, index: number) => {
            console.log(`  ${index + 1}. ${location.tenantName} (ID: ${location.tenantId})`);
          });
        }

        this.paginatedLocations = data;
        this.isLoadingPage = false; // Clear loading state
      },
      error: (error) => {
        console.error('=== LOAD LOCATIONS FAILED ===');
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Full error:', error);

        let errorMessage = 'Failed to load locations.';

        if (error.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
          this.authService.logout();
        } else if (error.status === 403) {
          errorMessage = 'Access denied. Super Admin privileges required.';
        } else if (error.status === 0) {
          errorMessage = 'Cannot connect to server. Please check if the backend is running.';
        }

        this.toastr.error(errorMessage);
        this.isLoadingPage = false; // Clear loading state on error
      }
    });
  }

  loadPage(page: number): void {
    if (page < 0 || page >= this.paginatedLocations.totalPages || page === this.currentPage) {
      return; // Invalid page or same page
    }
    this.currentPage = page;
    this.loadLocations();
  }

  // New method to change page size
  changePageSize(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 0; // Reset to first page when changing page size
    this.loadLocations();
  }

  // Navigation methods
  goToFirstPage(): void {
    this.loadPage(0);
  }

  goToPreviousPage(): void {
    this.loadPage(this.currentPage - 1);
  }

  goToNextPage(): void {
    this.loadPage(this.currentPage + 1);
  }

  goToLastPage(): void {
    this.loadPage(this.paginatedLocations.totalPages - 1);
  }

  // Utility methods for pagination info
  getCurrentPageDisplay(): number {
    return this.paginatedLocations.number + 1;
  }

  getTotalPages(): number {
    return this.paginatedLocations.totalPages;
  }

  getStartIndex(): number {
    return (this.paginatedLocations.number * this.paginatedLocations.size) + 1;
  }

  getEndIndex(): number {
    return Math.min((this.paginatedLocations.number + 1) * this.paginatedLocations.size, this.paginatedLocations.totalElements);
  }

  getTotalElements(): number {
    return this.paginatedLocations.totalElements;
  }

  getPageNumbers(): number[] {
    const totalPages = this.paginatedLocations.totalPages;
    const currentPage = this.paginatedLocations.number;
    const pages: number[] = [];

    if (totalPages <= 0) {
      return pages;
    }

    // Show max 7 page numbers for better navigation
    const maxPages = 7;
    let startPage = Math.max(0, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxPages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(0, endPage - maxPages + 1);
    }

    // Add ellipsis logic for large page counts
    if (totalPages > maxPages) {
      if (startPage > 0) {
        pages.push(0); // Always show first page
        if (startPage > 1) {
          pages.push(-1); // -1 represents ellipsis
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        if (i !== 0 && i !== totalPages - 1) { // Don't duplicate first/last pages
          pages.push(i);
        }
      }

      if (endPage < totalPages - 1) {
        if (endPage < totalPages - 2) {
          pages.push(-1); // -1 represents ellipsis
        }
        pages.push(totalPages - 1); // Always show last page
      }
    } else {
      // Show all pages if total is small
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  // Check if a page number represents an ellipsis
  isEllipsis(page: number): boolean {
    return page === -1;
  }

  // Keyboard navigation support
  @HostListener('document:keydown', ['$event'])
  handleKeyboardNavigation(event: KeyboardEvent): void {
    // Only handle keyboard navigation when not in input fields
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) {
      return;
    }

    // Handle pagination keyboard shortcuts
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          this.goToPreviousPage();
          break;
        case 'ArrowRight':
          event.preventDefault();
          this.goToNextPage();
          break;
        case 'Home':
          event.preventDefault();
          this.goToFirstPage();
          break;
        case 'End':
          event.preventDefault();
          this.goToLastPage();
          break;
      }
    }
  }

  // Enhanced page validation
  private isValidPage(page: number): boolean {
    return page >= 0 && page < this.paginatedLocations.totalPages;
  }

  // Get pagination summary text
  getPaginationSummary(): string {
    if (this.paginatedLocations.totalElements === 0) {
      return 'No locations found';
    }

    const start = this.getStartIndex();
    const end = this.getEndIndex();
    const total = this.getTotalElements();

    if (start === end) {
      return `Showing ${start} of ${total} location${total !== 1 ? 's' : ''}`;
    }

    return `Showing ${start}-${end} of ${total} location${total !== 1 ? 's' : ''}`;
  }

  deleteLocationAdmin(tenantId: number, locationName: string): void {
    console.log('=== DELETE LOCATION ADMIN ===');
    console.log('Tenant ID:', tenantId);
    console.log('Location Name:', locationName);
    console.log('Timestamp:', new Date().toISOString());

    // Step 1: Validate inputs
    if (!tenantId || tenantId <= 0) {
      this.toastr.error('Invalid tenant ID provided.');
      return;
    }

    if (!locationName || locationName.trim() === '') {
      this.toastr.error('Invalid location name provided.');
      return;
    }

    // Step 2: Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      this.toastr.error('Authentication token missing. Please login again.');
      this.authService.logout();
      return;
    }

    const decodedToken = this.authService.getDecodedToken();
    if (!decodedToken) {
      this.toastr.error('Invalid authentication token. Please login again.');
      this.authService.logout();
      return;
    }

    // Step 3: Check if user has SUPER_ADMIN role (handle both single role and roles array)
    const userRoles = decodedToken.roles || [];
    const userRole = decodedToken.role || '';
    const isSuperAdmin = userRoles.includes('ROLE_SUPER_ADMIN') || userRole === 'ROLE_SUPER_ADMIN';

    if (!isSuperAdmin) {
      this.toastr.error('Access denied. Super Admin privileges required.');
      return;
    }

    // Step 4: Check token expiration
    const currentTime = Date.now() / 1000;
    if (decodedToken.exp < currentTime) {
      this.toastr.error('Your session has expired. Please login again.');
      this.authService.logout();
      return;
    }

    console.log('✅ Authentication check passed for SUPER_ADMIN');
    console.log('Token expires at:', new Date(decodedToken.exp * 1000));

    // Step 5: Confirm deletion with user
    const confirmMessage = `⚠️ DELETE CONFIRMATION ⚠️\n\nYou are about to delete the administrator for "${locationName}".\n\nThis action will:\n• Remove the admin user permanently\n• Require you to create a new admin\n• Cannot be undone\n\nAre you absolutely sure you want to proceed?`;

    if (confirm(confirmMessage)) {
      console.log('✅ User confirmed deletion, making API call...');

      // Step 6: Show loading state
      this.toastr.info(`Deleting administrator for "${locationName}"...`, 'Processing', { timeOut: 2000 });

      // Step 7: Make the API call
      this.tenantService.deleteLocationAdmin(tenantId).subscribe({
        next: (response: any) => {
          console.log('✅ DELETE API CALL SUCCESS:', response);

          // Success message
          this.toastr.success(`Administrator for "${locationName}" deleted successfully!`, 'Success');

          // Store location info for creating new admin
          this.deletedLocationInfo = {
            tenantId: tenantId,
            locationName: locationName
          };

          // Show modal to create new admin
          this.showCreateAdminModal = true;

          // Refresh data
          this.loadLocations();
          this.loadDashboard();
        },
        error: (err: any) => {
          console.error('❌ DELETE API CALL FAILED ===');
          console.error('Error status:', err.status);
          console.error('Error statusText:', err.statusText);
          console.error('Error message:', err.message);
          console.error('Error body:', err.error);
          console.error('Full error object:', err);

          // Handle different error types
          this.handleDeleteError(err, tenantId, locationName);
        }
      });
    } else {
      console.log('❌ User cancelled deletion');
      this.toastr.info('Deletion cancelled by user.');
    }
  }

  private handleDeleteError(err: any, tenantId: number, locationName: string): void {
    let errorMessage = 'Failed to delete location administrator.';
    let showWorkaround = false;

    switch (err.status) {
      case 400:
        errorMessage = `Invalid request: ${err.error?.error || err.error?.message || 'Bad request'}`;
        break;

      case 401:
        errorMessage = 'Authentication failed. Please login again.';
        this.authService.logout();
        return;

      case 403:
        errorMessage = 'Access denied. Super Admin privileges required.';
        break;

      case 404:
        errorMessage = `Location administrator not found for "${locationName}". It may have already been deleted.`;
        // Still show create admin option
        showWorkaround = true;
        break;

      case 409:
        errorMessage = `Cannot delete administrator due to existing dependencies. ${err.error?.details || 'Please remove related records first.'}`;
        break;

      case 500:
        errorMessage = `Server error occurred while deleting administrator. ${err.error?.error || err.error?.details || ''}`;
        showWorkaround = true;
        break;

      case 0:
        errorMessage = 'Cannot connect to server. Please check if the backend is running.';
        break;

      default:
        if (err.error?.error) {
          errorMessage = err.error.error;
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        }
        showWorkaround = err.status >= 500;
        break;
    }

    // Show error message
    this.toastr.error(errorMessage, 'Delete Failed', { timeOut: 5000 });

    // Offer workaround for certain errors
    if (showWorkaround) {
      setTimeout(() => {
        const workaroundMessage = `The delete operation failed, but you can still create a new administrator for "${locationName}".\n\nWould you like to proceed with creating a new admin?\n\n(Note: You may need to manually verify the old admin was removed)`;

        if (confirm(workaroundMessage)) {
          this.proceedWithCreateAdmin(tenantId, locationName);
        }
      }, 2000);
    }
  }

  testAuthentication(): void {
    console.log('=== TESTING SUPER ADMIN AUTHENTICATION ===');

    const token = localStorage.getItem('token');
    console.log('Token exists:', !!token);

    if (!token) {
      this.toastr.error('No authentication token found.');
      return;
    }

    const decodedToken = this.authService.getDecodedToken();
    console.log('Decoded token:', decodedToken);

    if (!decodedToken) {
      this.toastr.error('Invalid token.');
      return;
    }

    const userRoles = decodedToken.roles || [];
    const userRole = decodedToken.role || '';
    console.log('User roles array:', userRoles);
    console.log('User single role:', userRole);

    const isSuperAdmin = userRoles.includes('ROLE_SUPER_ADMIN') || userRole === 'ROLE_SUPER_ADMIN';
    console.log('Is Super Admin:', isSuperAdmin);

    const currentTime = Date.now() / 1000;
    const isExpired = decodedToken.exp < currentTime;
    console.log('Token expired:', isExpired);
    console.log('Token expires at:', new Date(decodedToken.exp * 1000));

    if (isExpired) {
      this.toastr.error('Token has expired. Please login again.');
      this.authService.logout();
      return;
    }

    if (!isSuperAdmin) {
      this.toastr.error('Access denied. Super Admin role required.');
      return;
    }

    this.toastr.success('Authentication test passed! You have Super Admin access.');

    // Test the actual API call
    console.log('Testing actual locations API call...');
    this.tenantService.getPaginatedLocations(0, 1).subscribe({
      next: (response) => {
        console.log('Locations API test SUCCESS:', response);
        this.toastr.success('Locations API test passed!');
      },
      error: (error) => {
        console.error('Locations API test FAILED:', error);
        this.toastr.error(`Locations API test failed: ${error.status} - ${error.message}`);
      }
    });
  }

  createNewLocationAdmin(): void {
    console.log('Creating new location admin:', this.newAdminData);

    if (!this.deletedLocationInfo) {
      this.toastr.error('Location information missing.');
      return;
    }

    // Validate required fields
    if (!this.newAdminData.name || !this.newAdminData.email || !this.newAdminData.password) {
      this.toastr.error('Please fill in all required fields (Name, Email, Password).');
      return;
    }

    // Prepare admin data
    const adminData = {
      name: this.newAdminData.name.trim(),
      email: this.newAdminData.email.trim().toLowerCase(),
      password: this.newAdminData.password,
      role: 'ROLE_TENANT_ADMIN',
      contact: this.newAdminData.contact || '',
      department: '', // Empty for Super Admin created admins
      joiningDate: new Date().toISOString().split('T')[0], // Default to today
      address: '',
      gender: ''
    };



    // Use the proper Super Admin endpoint
    this.tenantService.createLocationAdmin(this.deletedLocationInfo.tenantId, adminData).subscribe({
      next: (response: any) => {
        this.toastr.success(
          `👤 New administrator "${this.newAdminData.name}" created successfully!\n` +
          `🏢 Location: "${this.deletedLocationInfo.locationName}"\n` +
          `📧 Welcome email with credentials sent to ${this.newAdminData.email}`,
          '✅ Admin Account Created',
          {
            timeOut: 7000,
            enableHtml: true,
            closeButton: true
          }
        );

        // Close modal and reset
        this.closeCreateAdminModal();

        // Refresh data
        this.loadLocations();
        this.loadDashboard();
      },
      error: (error: any) => {
        console.error('Failed to create new admin:', error);

        let errorMessage = 'Failed to create new administrator.';

        if (error.status === 400) {
          // Handle validation errors including email uniqueness
          if (error.error?.details) {
            // Our backend sends detailed error messages in the 'details' field
            if (error.error.details.includes('already registered')) {
              errorMessage = 'The email address is already registered with another user account. Please use a different email address.';
            } else if (error.error.details.includes('contact') || error.error.details.includes('phone')) {
              errorMessage = 'The contact number is already registered with another user account. Please use a different contact number.';
            } else {
              errorMessage = error.error.details;
            }
          } else if (error.error && typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          } else {
            errorMessage = 'Invalid input data. Please check all fields.';
          }
        } else if (error.status === 409) {
          errorMessage = 'Email address is already registered. Please use a different email.';
        } else if (error.status === 500) {
          errorMessage = 'A server error occurred. Please try again later or contact support.';
        } else if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.toastr.error(errorMessage, 'Admin Creation Failed', { timeOut: 5000 });
      }
    });
  }

  closeCreateAdminModal(): void {
    this.showCreateAdminModal = false;
    this.deletedLocationInfo = null;
    this.newAdminData = {
      name: '',
      email: '',
      password: '',
      contact: ''
    };
  }

  skipCreateAdmin(): void {
    this.toastr.info(`Location "${this.deletedLocationInfo?.locationName}" now has no administrator.`);
    this.closeCreateAdminModal();
  }

  proceedWithCreateAdmin(tenantId: number, locationName: string): void {
    // Store location info for creating new admin
    this.deletedLocationInfo = {
      tenantId: tenantId,
      locationName: locationName
    };

    // Show modal to create new admin
    this.showCreateAdminModal = true;

    this.toastr.info(`Creating new administrator for "${locationName}". Note: Please verify the old admin was actually deleted.`);
  }

  testBackendStatus(): void {
    // Test basic connectivity
    this.tenantService.getSuperAdminDashboard().subscribe({
      next: (response) => {
        this.toastr.success('Backend is running and accessible!');
      },
      error: (error) => {
        if (error.status === 0) {
          this.toastr.error('Backend is not running or not accessible!');
        } else {
          this.toastr.error(`Backend error: ${error.status} - ${error.message}`);
        }
      }
    });
  }
}
