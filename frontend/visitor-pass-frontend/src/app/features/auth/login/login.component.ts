import { Component } from '@angular/core';
<<<<<<< HEAD
import { CommonModule } from '@angular/common'; // <-- REQUIRED for *ngIf
import { FormsModule } from '@angular/forms';   // <-- REQUIRED for ngModel
import { Router, RouterModule } from '@angular/router'; // <-- Added RouterModule
=======
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
>>>>>>> 44b2135 (Updated Pagination and notification service)
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
<<<<<<< HEAD
  imports: [CommonModule, FormsModule, RouterModule], // <-- Added RouterModule
=======
  imports: [CommonModule, FormsModule, RouterModule],
>>>>>>> 44b2135 (Updated Pagination and notification service)
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  // VVV THIS IS THE FIX VVV
  // The backend expects a field named 'username', which will hold the user's email.
  credentials = { username: '', password: '' };
  
  isLoggingIn = false;

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

    this.isLoggingIn = true;
    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.toastr.error('Login failed. Please check your credentials and try again.');
        this.isLoggingIn = false;
      }
    });
  }
<<<<<<< HEAD

  // Method to handle forgot password navigation (backup method)
  onForgotPassword(): void {
    console.log('Navigating to forgot password page...');
    this.router.navigate(['/forgot-password']).then(
      (success) => console.log('Navigation successful:', success),
      (error) => console.error('Navigation failed:', error)
    );
  }
}
=======
}
>>>>>>> 44b2135 (Updated Pagination and notification service)
