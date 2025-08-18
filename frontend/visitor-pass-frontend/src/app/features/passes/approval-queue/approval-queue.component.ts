import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { PassService } from '../../../core/services/pass.service';
import { AuthService } from '../../../core/services/auth.service';
import { VisitorPass } from '../../../core/models/pass.model';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { ConfirmationService } from '../../../core/services/confirmation.service';

@Component({
  selector: 'app-approval-queue',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
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
    }
  }

  loadPendingPasses(): void {
    this.isLoading = true;
    this.passService.getPendingPasses(this.tenantId).subscribe({
      next: (allPasses) => {
        this.pendingPasses = allPasses.filter(p => p.status === 'PENDING');
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Failed to load approval queue.');
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
    } else if (reason !== null) { // User didn't click cancel
        this.toastr.warning('A reason is required to reject a pass.');
    }
  }
}
