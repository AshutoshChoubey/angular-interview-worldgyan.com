/**
 * @file 04-shell-dynamic-routes.ts
 * @description Dynamic Remote Microfrontend Routing & Functional Security Guards
 * @framework Angular 22+ (loadRemoteModule, CanActivateFn, HttpInterceptorFn)
 */

import { Routes, CanActivateFn, Router } from '@angular/router';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { AuthService } from '@shared/core';

/**
 * Functional Authentication Guard (Angular 22)
 * Validates singleton AuthService before permitting remote module bundle downloads.
 */
export const authGuard: CanActivateFn = (_route, _state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Gracefully redirect unauthenticated operators to dashboard with context flag
  return router.parseUrl('/dashboard?authRequired=true');
};

/**
 * Functional HTTP Interceptor (Angular 22)
 * Attaches JWT Bearer token from AuthService to outgoing API requests.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.token();

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};

/**
 * Dynamic Distributed Application Routes
 */
export const APP_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },
  {
    path: 'dashboard',
    // Embedded Standalone Host Dashboard (hosts Web Components)
    loadComponent: () =>
      import('./06-shell-dashboard-component').then(m => m.DashboardComponent)
  },
  {
    path: 'fault-management',
    canActivate: [authGuard],
    // Lazily downloads remote chunk from http://localhost:4201 on demand
    loadChildren: () =>
      loadRemoteModule('fault-management', './Module')
        .then(m => m.FAULT_MANAGEMENT_ROUTES)
        .catch(err => {
          console.error('[Federation Route Error: Fault Management]', err);
          throw err;
        })
  },
  {
    path: 'topology',
    canActivate: [authGuard],
    // Lazily downloads remote chunk from http://localhost:4202 on demand
    loadChildren: () =>
      loadRemoteModule('topology-manager', './Module')
        .then(m => m.TOPOLOGY_ROUTES)
        .catch(err => {
          console.error('[Federation Route Error: Topology Manager]', err);
          throw err;
        })
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
