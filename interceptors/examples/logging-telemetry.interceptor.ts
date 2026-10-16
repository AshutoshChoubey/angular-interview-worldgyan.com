/**
 * 4. Logging & Telemetry Interceptor
 * 
 * Demonstrates:
 * - High-precision performance.now() latency tracking
 * - Correlation ID injection for distributed APM tracing
 * - Clean logging on HttpResponse completion
 */
import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs';

export const loggingTelemetryInterceptor: HttpInterceptorFn = (req, next) => {
  const started = performance.now();
  const correlationId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);

  // Invariant: Attach X-Correlation-ID for distributed microservice tracing
  const tracedReq = req.clone({
    setHeaders: {
      'X-Correlation-ID': correlationId
    }
  });

  return next(tracedReq).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          const duration = Math.round(performance.now() - started);
          console.info(`[HTTP ${req.method}] ${req.urlWithParams} ➔ Status ${event.status} (${duration}ms) [CID: ${correlationId}]`);
        }
      },
      error: (error) => {
        const duration = Math.round(performance.now() - started);
        console.error(`[HTTP FAIL] ${req.method} ${req.urlWithParams} ➔ Status ${error.status} (${duration}ms) [CID: ${correlationId}]`);
      }
    })
  );
};

