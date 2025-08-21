import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  email: string = '';
  isSubmitting: boolean = false;
  isEmailSent: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.email || !this.isValidEmail(this.email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.isEmailSent = true;
        this.isSubmitting = false;
        this.toastr.success('If an account with this email exists, a reset link will be sent.', 'Reset Link Sent');
      },
      error: (error) => {
        this.isSubmitting = false;
        if (error.status === 400) {
          this.errorMessage = 'Invalid email format. Please check your email address.';
        } else {
          this.errorMessage = 'An error occurred. Please try again later.';
        }
        this.toastr.error(this.errorMessage, 'Error');
      }
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  goBackToLogin(): void {
    this.router.navigate(['/login']);
  }

  resendEmail(): void {
    this.isEmailSent = false;
    this.onSubmit();
  }
}
