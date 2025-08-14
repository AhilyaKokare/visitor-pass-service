import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LoginComponent } from './features/auth/login.component';
import { LayoutComponent } from './layout/layout.component';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      // Tenant Admin
      {
        path: 'admin',
        canActivate: [roleGuard(['ROLE_TENANT_ADMIN'])],
        children: [
          { path: 'dashboard', loadComponent: () => import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
          { path: 'users', loadComponent: () => import('./features/admin/users.component').then(m => m.UsersComponent) },
        ],
      },

      // Employee
      {
        path: 'employee',
        canActivate: [roleGuard(['ROLE_EMPLOYEE'])],
        children: [
          { path: 'passes/new', loadComponent: () => import('./features/employee/create-pass.component').then(m => m.CreatePassComponent) },
          { path: 'passes/history', loadComponent: () => import('./features/employee/pass-history.component').then(m => m.PassHistoryComponent) },
        ],
      },

      // Approver
      {
        path: 'approver',
        canActivate: [roleGuard(['ROLE_APPROVER'])],
        children: [
          { path: 'queue', loadComponent: () => import('./features/approver/approval-queue.component').then(m => m.ApprovalQueueComponent) },
        ],
      },

      // Security
      {
        path: 'security',
        canActivate: [roleGuard(['ROLE_SECURITY'])],
        children: [
          { path: 'dashboard', loadComponent: () => import('./features/security/security-dashboard.component').then(m => m.SecurityDashboardComponent) },
        ],
      },

      // Profile
      { path: 'profile', loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) },

      // Default
      { path: '', pathMatch: 'full', redirectTo: 'login' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];

// Register HttpClient + interceptor at app level (standalone)
export const httpConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
};
