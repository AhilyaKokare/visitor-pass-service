import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TenantService } from '../../../core/services/tenant.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SuperAdminDashboard } from '../../../core/models/tenant.model';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { AuthService } from '../../../core/services/auth.service'; // Import AuthService

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
  isLoading = true;
  isSubmitting = false;

  // This object will be bound to the form fields in the modal
  newTenantData: any = {};
  creatorName: string = '';

  constructor(
    private tenantService: TenantService,
    private toastr: ToastrService,
    private authService: AuthService // Inject AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getDecodedToken();
    if (user && user.sub) {
        // Get the creator's name (email) for auditing purposes
        this.creatorName = user.sub;
    }
    this.loadDashboard();
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
      next: () => {
        this.toastr.success('Tenant and Admin created successfully!');
        this.loadDashboard(); // Refresh the dashboard data to show the new tenant
        this.closeModalButton.nativeElement.click(); // Programmatically close the modal
        this.newTenantData = {}; // Reset the form object for the next use
        this.isSubmitting = false;
      },
      error: (err) => {
        // Display a specific error message from the backend if available
        this.toastr.error(err.error.message || 'Failed to create tenant. The admin email may already be in use.');
        this.isSubmitting = false;
      }
    });
  }
}
