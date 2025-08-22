import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
<<<<<<< HEAD
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
=======
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
>>>>>>> e594372 (Updated UI)

@Component({
  selector: 'app-reset-password',
  standalone: true,
<<<<<<< HEAD
  imports: [CommonModule, FormsModule, RouterModule, LoadingSpinnerComponent],
=======
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
>>>>>>> e594372 (Updated UI)
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
<<<<<<< HEAD
  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  isSubmitting: boolean = false;
  isPasswordReset: boolean = false;
  errorMessage: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  // Password strength indicators
  passwordStrength: {
    hasMinLength: boolean;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  } = {
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  };

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get token from URL parameters
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      if (!this.token) {
        this.toastr.error('Invalid reset link. Please request a new password reset.', 'Invalid Token');
        this.router.navigate(['/forgot-password']);
      }
    });
  }

  onPasswordChange(): void {
    this.checkPasswordStrength();
    this.clearErrors();
  }

  onConfirmPasswordChange(): void {
    this.clearErrors();
  }

  private checkPasswordStrength(): void {
    const password = this.newPassword;
    this.passwordStrength = {
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  }

  get isPasswordStrong(): boolean {
    return Object.values(this.passwordStrength).every(criteria => criteria);
  }

  get passwordsMatch(): boolean {
    return this.newPassword === this.confirmPassword;
  }

  private clearErrors(): void {
    this.errorMessage = '';
  }

=======
  resetPasswordForm: FormGroup;
  isSubmitting = false;
  isPasswordReset = false;
  token: string = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    if (!this.token) {
      this.toastr.error('Invalid reset link');
      this.router.navigate(['/login']);
    }
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { 'passwordMismatch': true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.resetPasswordForm.valid) {
      this.isSubmitting = true;
      
      const resetData = {
        token: this.token,
        newPassword: this.resetPasswordForm.value.newPassword,
        confirmPassword: this.resetPasswordForm.value.confirmPassword
      };

      this.authService.resetPassword(resetData).subscribe({
        next: (response) => {
          this.isPasswordReset = true;
          this.isSubmitting = false;
          this.toastr.success('Password reset successfully!');
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Reset password error:', error);
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
    Object.keys(this.resetPasswordForm.controls).forEach(key => {
      const control = this.resetPasswordForm.get(key);
      control?.markAsTouched();
    });
  }

>>>>>>> e594372 (Updated UI)
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

<<<<<<< HEAD
  onSubmit(): void {
    // Validation
    if (!this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    if (!this.isPasswordStrong) {
      this.errorMessage = 'Password does not meet the required criteria.';
      return;
    }

    if (!this.passwordsMatch) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: () => {
        this.isPasswordReset = true;
        this.isSubmitting = false;
        this.toastr.success('Your password has been reset successfully!', 'Password Reset');
      },
      error: (error) => {
        this.isSubmitting = false;
        if (error.status === 403) {
          this.errorMessage = 'Invalid or expired reset token. Please request a new password reset.';
          this.toastr.error('Reset link has expired or is invalid.', 'Invalid Token');
        } else if (error.status === 400) {
          this.errorMessage = 'Password does not meet the required criteria.';
        } else {
          this.errorMessage = 'An error occurred. Please try again later.';
        }
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  requestNewReset(): void {
    this.router.navigate(['/forgot-password']);
  }
=======
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
>>>>>>> e594372 (Updated UI)
}
