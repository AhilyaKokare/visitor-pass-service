import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { PassService } from '../../../core/services/pass.service';
import { AuthService } from '../../../core/services/auth.service';
<<<<<<< HEAD
import { Router } from '@angular/router';
import { VisitorPass, EmailNotificationRequest } from '../../../core/models/pass.model';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
=======
import { CreatePassPayload } from '../../../core/models/pass.model';
>>>>>>> 44b2135 (Updated Pagination and notification service)

@Component({
  selector: 'app-create-pass',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './create-pass.component.html',
  styleUrls: ['./create-pass.component.scss']
})
export class CreatePassComponent {
  // Initialize with the CreatePassPayload interface for type safety
  passData: CreatePassPayload = {
    visitorName: '',
    visitorEmail: '',
    visitorPhone: '',
    purpose: '',
    visitDateTime: ''
  };

  tenantId!: number;
  isSubmitting = false;
  isSendingEmail = false;

  constructor(
    private passService: PassService,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {
    const user = this.authService.getDecodedToken();
    if (user && user.tenantId) {
      this.tenantId = user.tenantId;
    } else {
      this.toastr.error('Could not identify your location. Please log in again.');
    }
  }

  onCreatePass(): void {
<<<<<<< HEAD
    if (!this.passData.visitorEmail) {
      this.toastr.error('Visitor email is required to send pass details.');
      return;
    }

=======
    if (!this.tenantId) {
      this.toastr.error('User tenant not found. Cannot create pass.');
      return;
    }
>>>>>>> 44b2135 (Updated Pagination and notification service)
    this.isSubmitting = true;

    // The passData object now correctly matches the required API payload
    this.passService.createPass(this.tenantId, this.passData).subscribe({
      next: (createdPass: VisitorPass) => {
        this.toastr.success('Visitor pass request submitted successfully!');
<<<<<<< HEAD

        // Send email notification to visitor
        this.sendPassCreatedEmail(createdPass);
=======
        this.router.navigate(['/passes/my-pass-history']); // Navigate to a more relevant page
        this.isSubmitting = false;
>>>>>>> 44b2135 (Updated Pagination and notification service)
      },
      error: (err) => {
        // More specific error handling
        const errorMessage = err?.error?.message || 'Failed to submit pass request. Please check the details and try again.';
        this.toastr.error(errorMessage);
        this.isSubmitting = false;
      }
    });
  }
<<<<<<< HEAD

  private sendPassCreatedEmail(pass: VisitorPass): void {
    this.isSendingEmail = true;

    const emailRequest: EmailNotificationRequest = {
      passId: pass.id,
      visitorEmail: pass.visitorEmail,
      emailType: 'PASS_CREATED'
    };

    this.passService.sendPassCreatedEmail(this.tenantId, emailRequest).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastr.success(
            `Pass details sent to ${pass.visitorEmail}`,
            'Email Sent Successfully!'
          );
        } else {
          this.toastr.warning(
            `Pass created but email failed: ${response.message}`,
            'Email Warning'
          );
        }
        this.isSubmitting = false;
        this.isSendingEmail = false;
        this.router.navigate(['/passes/history']);
      },
      error: (err) => {
        this.toastr.warning(
          'Pass created successfully, but failed to send email notification.',
          'Email Failed'
        );
        console.error('Email sending error:', err);
        this.isSubmitting = false;
        this.isSendingEmail = false;
        this.router.navigate(['/passes/history']);
      }
    });
  }
}
=======
}
>>>>>>> 44b2135 (Updated Pagination and notification service)
