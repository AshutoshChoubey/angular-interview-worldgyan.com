/**
 * 2. Silent Refresh Token Mutex Interceptor (401 Interception & Replay Queue)
 * 
 * Demonstrates:
 * - Handling 401 Unauthorized without infinite loops
 * - Concurrency mutex lock (isRefreshing flag)
 * - Queuing parallel requests behind BehaviorSubject
 * - Automatic replay of original requests with new access token
 */
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from './auth.service';

// Concurrency mutex state across interceptor calls
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const refreshTokenMutexInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Catch 401 Unauthorized errors
      // Invariant: Ignore the refresh endpoint itself to prevent infinite refresh loops
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        
        if (!isRefreshing) {
          // 1. Acquire mutex lock
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return authService.refreshToken().pipe(
            switchMap((response) => {
              // 2. Release mutex lock and emit new token to waiting requests
              isRefreshing = false;
              refreshTokenSubject.next(response.accessToken);

              // 3. Replay the original failed request with the new access token
              const retriedReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${response.accessToken}`
                }
              });
              return next(retriedReq);
            }),
            catchError((refreshErr) => {
              // Refresh token is expired or revoked; force logout
              isRefreshing = false;
              refreshTokenSubject.next(null);
              authService.logout();
              return throwError(() => refreshErr);
            })
          );
        } else {
          // Concurrency branch: Wait for the in-flight refresh to complete, then replay
          return refreshTokenSubject.pipe(
            filter((token) => token !== null),
            take(1),
            switchMap((token) => {
              const retriedReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${token}`
                }
              });
              return next(retriedReq);
            })
          );
        }
      }

      return throwError(() => error);
    })
  );
};

