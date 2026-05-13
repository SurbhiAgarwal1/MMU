import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthStore } from '../state/auth.store';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthStore);
  const router = inject(Router);

  const allowedRoles: string[] = route.data['roles'] ?? [];
  const userRole = auth.userRole();

  if (!userRole || !allowedRoles.includes(userRole)) {
    return router.createUrlTree(['/dashboard']);
  }
  return true;
};
