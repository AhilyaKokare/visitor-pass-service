import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { PassService } from '../../../core/services/pass.service';
import { AuthService } from '../../../core/services/auth.service';
import { VisitorPass } from '../../../core/models/pass.model';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { Page } from '../../../shared/pagination/pagination.component';

@Component({
  selector: 'app-approval-queue',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, DatePipe],
  templateUrl: './approval-queue.component.html',
})
export class ApprovalQueueComponent implements OnInit {
  pendingPasses: VisitorPass[] = [];
  tenantId!: number;
  isLoading = true;

  constructor(
    private passService: PassService,
    private authService: AuthService,
    private toastr: ToastrService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getDecodedToken();
    if (user && user.tenantId) {
      this.tenantId = user.tenantId;
      this.loadPendingPasses();
    }else {
      this.toastr.error('Could not identify your location. Please log in again.');
      this.isLoading = false; // Stop loading if tenantId is missing
    }

  }

  loadPendingPasses(): void {
    this.isLoading = true;
    this.passService.getPassesForTenant(this.tenantId, 0, 100).subscribe({
      next: (page: Page<VisitorPass>) => {
        this.pendingPasses = page.content.filter((p: VisitorPass) => p.status === 'PENDING');
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error('Failed to load approval queue.');
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  approve(passId: number): void {
    if (this.confirmationService.confirm('Are you sure you want to approve this pass?')) {
      this.passService.approvePass(this.tenantId, passId).subscribe({
        next: () => {
          this.toastr.success('Pass approved successfully!');
          this.loadPendingPasses();
        },
        error: (err) => this.toastr.error(err.error.message || 'Failed to approve pass.'),
      });
    }
  }

  reject(passId: number): void {
    const reason = prompt('Please provide a reason for rejection (required):');
    if (reason && reason.trim()) {
      this.passService.rejectPass(this.tenantId, passId, reason).subscribe({
        next: () => {
          this.toastr.info('Pass has been rejected.');
          this.loadPendingPasses();
        },
        error: (err) => this.toastr.error(err.error.message || 'Failed to reject pass.'),
      });
    } else if (reason !== null) {
        this.toastr.warning('A reason is required to reject a pass.');
    }
  }
}
