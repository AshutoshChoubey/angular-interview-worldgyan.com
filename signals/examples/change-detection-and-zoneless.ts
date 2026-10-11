import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  ChangeDetectorRef,
  provideZonelessChangeDetection,
  ApplicationConfig
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Example 6: Change Detection Strategies (Default vs OnPush) & Zoneless Angular
 *
 * Demonstrates:
 * 1. How Signals automatically mark OnPush components dirty without manual ChangeDetectorRef.
 * 2. Difference between traditional RxJS/primitive state in OnPush vs Signal state.
 * 3. Zoneless Angular application configuration.
 */

// ============================================================================
// 1. OnPush Component with Traditional Variables vs Signals
// ============================================================================

@Component({
  selector: 'app-onpush-comparison',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card">
      <h3>ChangeDetectionStrategy.OnPush Demo</h3>

      <!-- Traditional primitive variable -->
      <p>Traditional Primitive: {{ traditionalCount }} (Will NOT auto-update outside events!)</p>

      <!-- Signal: Automatically triggers view refresh when updated -->
      <p>Signal Count: {{ signalCount() }}</p>
      <p>Double Signal: {{ doubleSignal() }}</p>

      <button (click)="incrementSignal()">Increment Signal (Trigger)</button>
      <button (click)="simulateAsyncNonSignalUpdate()">Async Update (Non-Signal)</button>
    </div>
  `
})
export class OnPushComparisonComponent {
  private cdr = inject(ChangeDetectorRef);

  // Traditional property - In OnPush, if updated asynchronously (e.g. via timer/websocket),
  // Angular will NOT detect this change unless cdr.markForCheck() is manually called!
  traditionalCount = 0;

  // Signal property - In OnPush, whenever signalCount.set() or .update() is called,
  // Angular's reactive graph automatically marks this specific view dirty for check!
  signalCount = signal(0);
  doubleSignal = computed(() => this.signalCount() * 2);

  incrementSignal() {
    this.signalCount.update(c => c + 1);
  }

  simulateAsyncNonSignalUpdate() {
    setTimeout(() => {
      this.traditionalCount += 10;
      console.log('traditionalCount updated to:', this.traditionalCount);
      // In OnPush, without this manual call below, the UI will NOT update:
      // this.cdr.markForCheck();
    }, 1000);
  }
}

// ============================================================================
// 2. Zoneless Application Bootstrap Configuration (Angular 20 – 22+)
// ============================================================================

/**
 * In Zoneless Angular (Stable in Angular 20.2+, Default in Angular 21/22+):
 * - zone.js is completely eliminated from polyfills and bundles.
 * - Angular no longer monkey-patches setTimeout, Promise, or addEventListener.
 * - Signals directly schedule fine-grained re-renders through the application scheduler.
 * - (Optional) If legacy Zone.js behavior is needed, use provideZoneChangeDetection().
 */
export const zonelessAppConfig: ApplicationConfig = {
  providers: [
    // Stable API in Angular 22 (graduated from experimental)
    provideZonelessChangeDetection()
  ]
};
