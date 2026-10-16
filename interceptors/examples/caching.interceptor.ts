/**
 * 5. In-Memory Caching Interceptor (Idempotent GET Requests)
 * 
 * Demonstrates:
 * - In-memory Map cache with TTL (Time-To-Live) expiration
 * - Header-gated caching (e.g. 'X-Cache: true')
 * - Returning cached responses synchronously via of()
 */
import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, tap } from 'rxjs';

interface CacheEntry {
  response: HttpResponse<unknown>;
  expiry: number;
}

const responseCache = new Map<string, CacheEntry>();
const DEFAULT_TTL_MS = 60_000; // 60 seconds

export const cachingInterceptor: HttpInterceptorFn = (req, next) => {
  // Only cache GET requests that explicitly enable caching via header
  if (req.method !== 'GET' || !req.headers.has('X-Cache')) {
    return next(req);
  }

  const cacheKey = req.urlWithParams;
  const cached = responseCache.get(cacheKey);

  // Serve valid cached response if still within TTL
  if (cached && Date.now() < cached.expiry) {
    return of(cached.response.clone());
  }

  // Remove the trigger header before sending request upstream
  const cleanReq = req.clone({
    headers: req.headers.delete('X-Cache')
  });

  return next(cleanReq).pipe(
    tap((event) => {
      if (event instanceof HttpResponse && event.status === 200) {
        responseCache.set(cacheKey, {
          response: event.clone(),
          expiry: Date.now() + DEFAULT_TTL_MS
        });
      }
    })
  );
};

