import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- REQUIRED for *ngIf
import { FormsModule } from '@angular/forms';   // <-- REQUIRED for ngModel
import { Router, RouterModule } from '@angular/router'; // <-- Added RouterModule
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // <-- Added RouterModule
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  credentials = { username: '', password: '' };
  errorMessage = '';
  isSubmitting = false;

  constructor(private authService: AuthService, private router: Router) {}

  onLogin(): void {
    this.errorMessage = '';
    this.isSubmitting = true;
    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage = 'Login failed. Please check your credentials.';
        this.isSubmitting = false;
      }
    });
  }

  // Method to handle forgot password navigation (backup method)
  onForgotPassword(): void {
    console.log('Navigating to forgot password page...');
    this.router.navigate(['/forgot-password']).then(
      (success) => console.log('Navigation successful:', success),
      (error) => console.error('Navigation failed:', error)
    );
  }
}
