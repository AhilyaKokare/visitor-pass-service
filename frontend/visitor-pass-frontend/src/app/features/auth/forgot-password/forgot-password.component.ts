import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
<<<<<<< HEAD
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
=======
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
>>>>>>> e594372 (Updated UI)

@Component({
  selector: 'app-forgot-password',
  standalone: true,
<<<<<<< HEAD
  imports: [CommonModule, FormsModule, RouterModule, LoadingSpinnerComponent],
=======
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
>>>>>>> e594372 (Updated UI)
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
<<<<<<< HEAD
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
=======
  forgotPasswordForm: FormGroup;
  isSubmitting = false;
  isEmailSent = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.isSubmitting = true;
      
      this.authService.forgotPassword(this.forgotPasswordForm.value).subscribe({
        next: (response) => {
          this.isEmailSent = true;
          this.isSubmitting = false;
          this.toastr.success('Password reset email sent successfully!');
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Forgot password error:', error);
          let errorMessage = 'An error occurred. Please try again.';

          if (error.error) {
            errorMessage = typeof error.error === 'string' ? error.error : error.error.message || errorMessage;
          } else if (error.message) {
            errorMessage = error.message;
          }

          this.toastr.error(errorMessage);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.forgotPasswordForm.controls).forEach(key => {
      const control = this.forgotPasswordForm.get(key);
      control?.markAsTouched();
    });
>>>>>>> e594372 (Updated UI)
  }

  goBackToLogin(): void {
    this.router.navigate(['/login']);
  }
<<<<<<< HEAD

  resendEmail(): void {
    this.isEmailSent = false;
    this.onSubmit();
  }
=======
>>>>>>> e594372 (Updated UI)
}
