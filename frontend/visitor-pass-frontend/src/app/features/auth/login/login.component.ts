import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- REQUIRED for *ngIf
import { FormsModule } from '@angular/forms';   // <-- REQUIRED for ngModel
import { Router, RouterModule } from '@angular/router'; // <-- Added RouterModule
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // <-- Added RouterModule
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  // The backend expects a field named 'username', which will hold the user's email.
  credentials = { username: '', password: '' };

  isLoggingIn = false;
  showPassword = false;
  rememberMe = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  onLogin(): void {
    // Note: The credentials object now has 'username' but the form validation is for email.
    // This is handled in the HTML.
    if (!this.credentials.username || !this.credentials.password) {
      this.toastr.error('Please enter both email and password.');
      return;
    }

    console.log('🔐 Login attempt:', {
      username: this.credentials.username,
      password: '***hidden***',
      apiUrl: 'http://localhost:8080/api/auth/login'
    });

    this.isLoggingIn = true;
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        console.log('✅ Login successful:', response);
        this.toastr.success('Login successful! Welcome back.');
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('❌ Login failed:', err);
        console.error('Error details:', {
          status: err.status,
          statusText: err.statusText,
          message: err.message,
          error: err.error
        });

        let errorMessage = 'Login failed. Please check your credentials and try again.';

        if (err.status === 0) {
          errorMessage = 'Cannot connect to server. Please check if the backend is running.';
        } else if (err.status === 401) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (err.status === 403) {
          errorMessage = 'Access denied. Please contact your administrator.';
        } else if (err.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }

        this.toastr.error(errorMessage);
        this.isLoggingIn = false;
      }
    });
  }
}
