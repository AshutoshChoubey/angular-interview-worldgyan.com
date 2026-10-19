/**
 * 08-functional-services-and-destroyref.ts
 *
 * Demonstrates:
 * 1. Functional Services (Custom Hook equivalents) in Angular 22 using inject().
 * 2. Automatic teardown and cleanup using DestroyRef.onDestroy().
 * 3. RxJS takeUntilDestroyed() operator for subscription leak prevention.
 * 4. Bridging browser APIs (window resize, online/offline, interval) into reactive signals.
 */

import { Component, DestroyRef, Signal, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';

/**
 * 1. Composable Functional Service: useWindowDimensions
 * Listens to browser resize events and automatically cleans up its listener on destruction.
 */
export function useWindowDimensions(): { width: Signal<number>; height: Signal<number> } {
  const width = signal(typeof window !== 'undefined' ? window.innerWidth : 1080);
  const height = signal(typeof window !== 'undefined' ? window.innerHeight : 1080);

  if (typeof window !== 'undefined') {
    const handleResize = () => {
      width.set(window.innerWidth);
      height.set(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // ⚡ DestroyRef captures the active component or service injection context:
    inject(DestroyRef).onDestroy(() => {
      window.removeEventListener('resize', handleResize);
      console.log('[useWindowDimensions] resize listener removed.');
    });
  }

  return {
    width: width.asReadonly(),
    height: height.asReadonly()
  };
}

/**
 * 2. Composable Functional Service: useOnlineStatus
 * Exposes a reactive boolean signal reflecting browser network connectivity.
 */
export function useOnlineStatus(): Signal<boolean> {
  const isOnline = signal(typeof navigator !== 'undefined' ? navigator.onLine : true);

  if (typeof window !== 'undefined') {
    const setOnline = () => isOnline.set(true);
    const setOffline = () => isOnline.set(false);

    window.addEventListener('online', setOnline);
    window.addEventListener('offline', setOffline);

    inject(DestroyRef).onDestroy(() => {
      window.removeEventListener('online', setOnline);
      window.removeEventListener('offline', setOffline);
    });
  }

  return isOnline.asReadonly();
}

/**
 * Standalone Component demonstrating functional services consumption:
 */
@Component({
  selector: 'app-responsive-dashboard',
  standalone: true,
  template: `
    <div class="dashboard-widget">
      <h3>Window Size: {{ windowSize.width() }} × {{ windowSize.height() }}</h3>
      <p>Network Status: {{ isOnline() ? '🟢 Online' : '🔴 Offline' }}</p>
    </div>
  `
})
export class ResponsiveDashboardComponent {
  // ✅ Functional services invoked directly in field initializers:
  readonly windowSize = useWindowDimensions();
  readonly isOnline = useOnlineStatus();

  constructor() {
    // ✅ takeUntilDestroyed() automatically terminates interval subscription on unmount:
    interval(2000)
      .pipe(takeUntilDestroyed())
      .subscribe(tick => {
        console.log(`[Dashboard Heartbeat] Tick ${tick}`);
      });
  }
}
