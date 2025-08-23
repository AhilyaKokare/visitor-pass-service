import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

interface DecodedToken {
  sub: string;
  role: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  currentUser$: Observable<DecodedToken | null>;
  isMobileMenuOpen = false;

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.getCurrentUser();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  logout(): void {
    this.authService.logout();
  }

  getRoleDisplayName(role: string): string {
    const roleMap: { [key: string]: string } = {
      'ROLE_SUPER_ADMIN': 'Super Admin',
      'ROLE_TENANT_ADMIN': 'Location Admin',
      'ROLE_EMPLOYEE': 'Employee',
      'ROLE_APPROVER': 'Approver',
      'ROLE_SECURITY': 'Security'
    };
    return roleMap[role] || role.replace('ROLE_', '');
  }
}
