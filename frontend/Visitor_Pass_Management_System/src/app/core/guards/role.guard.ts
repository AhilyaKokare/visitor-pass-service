import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Generic role guard. Use in routes: canActivate: [roleGuard(['ROLE_TENANT_ADMIN'])]
export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return (_route: ActivatedRouteSnapshot) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const role = auth.role;
    if (!auth.isAuthenticated || !role || !allowedRoles.includes(role)) {
      router.navigate(['/login']);
      return false;
    }
    return true;
  };
}