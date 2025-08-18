import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TenantService } from '../../../core/services/tenant.service';
import { TenantDashboardInfo } from '../../../core/models/tenant.model';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './super-admin-dashboard.component.html'
})
export class SuperAdminDashboardComponent implements OnInit {
  @ViewChild('closeModalButton') closeModalButton!: ElementRef;

  tenants: TenantDashboardInfo[] = [];
  newTenantData: any = {};
  isLoading = true;
  isSubmitting = false;

  constructor(
    private tenantService: TenantService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadTenants();
  }

  loadTenants(): void {
    this.isLoading = true;
    this.tenantService.getTenants().subscribe({
      next: (data) => {
        this.tenants = data;
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Failed to load tenants.');
        this.isLoading = false;
      }
    });
  }

  onCreateTenant(): void {
    this.isSubmitting = true;
    this.tenantService.createTenantAndAdmin(this.newTenantData).subscribe({
      next: () => {
        this.toastr.success('Tenant and Admin created successfully!');
        this.loadTenants();
        this.closeModalButton.nativeElement.click();
        this.newTenantData = {};
        this.isSubmitting = false;
      },
      error: (err) => {
        this.toastr.error(err.error.message || 'Failed to create tenant.');
        this.isSubmitting = false;
      }
    });
  }
}
