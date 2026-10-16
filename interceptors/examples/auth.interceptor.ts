/**
 * 1. Authentication Interceptor (Bearer Token Injection)
 * 
 * Demonstrates:
 * - Functional HttpInterceptorFn with inject()
 * - Request cloning with immutable setHeaders
 * - HttpContextToken to selectively bypass auth on public endpoints
 * - Strict domain whitelisting to prevent token leakage
 */
import { HttpInterceptorFn, HttpContextToken } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

/**
 * Context token allowing callers to bypass authentication (e.g. login/signup calls)
 */
export const BYPASS_AUTH = new HttpContextToken<boolean>(() => false);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Check if this request explicitly requested an auth bypass
  if (req.context.get(BYPASS_AUTH)) {
    return next(req);
  }

  const authService = inject(AuthService);
  const token = authService.accessToken(); // Reactive signal access

  // Security invariant: Only attach Bearer token to trusted internal API endpoints
  const isTrustedApi = req.url.startsWith('https://api.worldgyan.com') || req.url.startsWith('/api/');

  if (token && isTrustedApi) {
    const authorizedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authorizedReq);
  }

  return next(req);
};

