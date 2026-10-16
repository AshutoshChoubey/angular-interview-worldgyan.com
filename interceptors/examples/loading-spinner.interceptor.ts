/**
 * 6. Global Loading Spinner Interceptor
 * 
 * Demonstrates:
 * - Active request reference counting
 * - Driving UI loading spinners / top progress bars
 * - finalize() operator ensuring decrement on success, error, or cancellation
 */
import { HttpInterceptorFn } from '@angular/common/http';
import { Injectable, inject, signal, computed } from '@angular/core';
import { finalize } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private activeRequests = signal<number>(0);

  readonly isLoading = computed(() => this.activeRequests() > 0);

  increment() {
    this.activeRequests.update(count => count + 1);
  }

  decrement() {
    this.activeRequests.update(count => Math.max(0, count - 1));
  }
}

export const loadingSpinnerInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Increment active counter when request initiates
  loadingService.increment();

  return next(req).pipe(
    // Invariant: finalize() is guaranteed to run on complete, error, or unsubscription
    finalize(() => {
      loadingService.decrement();
    })
  );
};
