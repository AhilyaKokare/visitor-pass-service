import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

// Simple, modern login page
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div class="card shadow-sm" style="max-width: 420px; width: 100%">
        <div class="card-body p-4">
          <h4 class="mb-3 text-center">Sign in</h4>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input type="email" class="form-control" formControlName="username" placeholder="you@company.com" />
            </div>
            <div class="mb-3">
              <label class="form-label">Password</label>
              <input type="password" class="form-control" formControlName="password" placeholder="••••••••" />
            </div>
            <button class="btn btn-primary w-100" [disabled]="form.invalid || loading">
              {{ loading ? 'Signing in...' : 'Sign in' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = false;
  form = this.fb.group({
    username: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  // After login, route based on role to relevant dashboard
  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.auth.login(this.form.value as any).subscribe({
      next: () => {
        this.loading = false;
        const role = this.auth.role;
        switch (role) {
          case 'ROLE_SUPER_ADMIN':
            this.router.navigate(['/super-admin/tenants']); break;
          case 'ROLE_TENANT_ADMIN':
            this.router.navigate(['/admin/dashboard']); break;
          case 'ROLE_EMPLOYEE':
            this.router.navigate(['/employee/passes/new']); break;
          case 'ROLE_APPROVER':
            this.router.navigate(['/approver/queue']); break;
          case 'ROLE_SECURITY':
            this.router.navigate(['/security/dashboard']); break;
          default:
            this.router.navigate(['/']);
        }
      },
      error: () => { this.loading = false; },
    });
  }
}