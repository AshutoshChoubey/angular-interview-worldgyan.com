/**
 * 7. Security Headers & CSRF Interceptor
 * 
 * Demonstrates:
 * - Adding standard enterprise security headers to mutating requests
 * - CSRF (Cross-Site Request Forgery) protection headers
 * - App version identification for cache busting and API routing
 */
import { HttpInterceptorFn } from '@angular/common/http';

export const securityHeadersInterceptor: HttpInterceptorFn = (req, next) => {
  const secureReq = req.clone({
    setHeaders: {
      'X-Requested-With': 'XMLHttpRequest',
      'X-Client-Platform': 'Angular-Web',
      'X-Client-Version': '22.0.0'
    }
  });

  return next(secureReq);
};

