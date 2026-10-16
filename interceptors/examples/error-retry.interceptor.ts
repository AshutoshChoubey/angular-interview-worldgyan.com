/**
 * 3. Error Handling & Exponential Backoff Retry Interceptor
 * 
 * Demonstrates:
 * - Selective retrying of idempotent HTTP methods (GET, HEAD, OPTIONS)
 * - Exponential backoff delay calculation using timer()
 * - Centralized handling of 5xx server errors
 */
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, retry, timer, throwError } from 'rxjs';

export const errorRetryInterceptor: HttpInterceptorFn = (req, next) => {
  // Idempotent methods that are safe to automatically retry
  const isIdempotent = req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS';

  return next(req).pipe(
    retry({
      count: isIdempotent ? 2 : 0, // Retry up to 2 times for idempotent requests
      delay: (error: HttpErrorResponse, retryCount: number) => {
        // Do not retry 4xx client errors (400, 401, 403, 404)
        if (error.status >= 400 && error.status < 500) {
          throw error;
        }
        // Exponential backoff delay: 1000ms, 2000ms, etc.
        const delayMs = retryCount * 1000;
        console.warn(`[HTTP Retry] Retrying ${req.url} (Attempt ${retryCount}) after ${delayMs}ms...`);
        return timer(delayMs);
      }
    }),
    catchError((error: HttpErrorResponse) => {
      if (error.status >= 500) {
        console.error(`[Server Error ${error.status}] ${req.url}:`, error.message);
      }
      return throwError(() => error);
    })
  );
};
