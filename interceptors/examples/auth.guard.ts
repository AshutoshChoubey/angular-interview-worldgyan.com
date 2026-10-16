/**
 * Functional Route Guard (CanActivateFn)
 * 
 * Demonstrates:
 * - Pure functional route guard replacing legacy CanActivate classes
 * - Reading Signal-based state via inject(AuthService)
 * - Returning UrlTree with returnUrl query parameter for seamless post-login redirect
 */
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If user is authenticated via Signal, allow navigation
  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirect to /login and preserve attempted URL in queryParams
  return router.createUrlTree(['/login'], {
    queryParams: {
      returnUrl: state.url
    }
  });
};

