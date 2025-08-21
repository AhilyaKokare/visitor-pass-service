import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { PassService } from '../../../core/services/pass.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { VisitorPass, EmailNotificationRequest } from '../../../core/models/pass.model';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-create-pass',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './create-pass.component.html',
  styleUrls: ['./create-pass.component.scss']
})
export class CreatePassComponent {
  passData: any = {};
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
    }
  }

  onCreatePass(): void {
    if (!this.passData.visitorEmail) {
      this.toastr.error('Visitor email is required to send pass details.');
      return;
    }

    this.isSubmitting = true;
    this.passService.createPass(this.tenantId, this.passData).subscribe({
      next: (createdPass: VisitorPass) => {
        this.toastr.success('Visitor pass request submitted successfully!');

        // Send email notification to visitor
        this.sendPassCreatedEmail(createdPass);
      },
      error: (err) => {
        this.toastr.error(err.error.message || 'Failed to submit pass request.');
        this.isSubmitting = false;
      }
    });
  }

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
