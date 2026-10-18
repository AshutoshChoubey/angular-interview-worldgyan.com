/**
 * Example 02: Zoneless Change Detection Architecture
 * Angular 22 Production Architecture
 *
 * Demonstrates:
 * 1. Configuring provideZonelessChangeDetection() in app.config.ts
 * 2. Why zone.js is completely eliminated from polyfills (-15kB bundle savings)
 * 3. The critical Zoneless gotcha: plain variable mutation in setTimeout fails!
 * 4. Reactive Signal updates triggering the Zoneless microtask scheduler
 */

import {
  ApplicationConfig,
  provideZonelessChangeDetection,
  Component,
  signal,
  ChangeDetectorRef,
  inject,
  OnInit
} from '@angular/core';
import { provideRouter } from '@angular/router';

/**
 * ---------------------------------------------------------------------------
 * 1. APPLICATION BOOTSTRAPPING (app.config.ts)
 * ---------------------------------------------------------------------------
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Enables native microtask scheduling; completely bypasses zone.js polyfill!
    provideZonelessChangeDetection(),
    provideRouter([])
  ]
};

/**
 * ---------------------------------------------------------------------------
 * 2. ZONELESS COUNTER: PITFALL VS. PRODUCTION PATTERN
 * ---------------------------------------------------------------------------
 */
@Component({
  selector: 'app-zoneless-counter',
  standalone: true,
  template: `
    <div class="zoneless-box">
      <h3>Angular 22 Zoneless Engine</h3>

      <div class="counter-display">
        <p><strong>Plain Counter (No Signal):</strong> {{ plainCount }}</p>
        <p><strong>Reactive Signal Counter:</strong> {{ signalCount() }}</p>
      </div>

      <div class="button-group">
        <button (click)="triggerAsyncTimeoutPitfall()">❌ Trigger Plain setTimeout</button>
        <button (click)="triggerSignalTimeout()">✅ Trigger Signal setTimeout</button>
        <button (click)="triggerManualMarkForCheck()">🛠️ Fix Plain with markForCheck()</button>
      </div>
    </div>
  `
})
export class ZonelessCounterComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);

  // Plain non-reactive variable
  plainCount = 0;

  // Modern Angular 22 Reactive Signal
  readonly signalCount = signal(0);

  ngOnInit(): void {
    console.log('Zoneless Component Initialized. Zone.js is NOT active.');
  }

  /**
   * ❌ THE ZONELESS GOTCHA:
   * In traditional Angular with Zone.js, setTimeout monkey-patching triggers
   * ApplicationRef.tick() automatically when the timer finishes.
   *
   * In ZONELESS Angular, setTimeout is native browser code!
   * Angular is completely unaware that `plainCount` was incremented,
   * so the UI will NEVER refresh!
   */
  triggerAsyncTimeoutPitfall(): void {
    setTimeout(() => {
      this.plainCount++;
      console.warn(
        `[Zoneless Pitfall] plainCount is now ${this.plainCount}, but DOM was NOT updated!`
      );
    }, 500);
  }

  /**
   * ✅ MODERN ZONELESS STANDARD:
   * Updating a Signal notifies Angular's reactive scheduler directly.
   * The scheduler enqueues a microtask and executes a targeted O(1) DOM patch.
   */
  triggerSignalTimeout(): void {
    setTimeout(() => {
      this.signalCount.update((c) => c + 1);
      console.log(
        `[Zoneless Success] signalCount updated to ${this.signalCount()}. Microtask scheduled and DOM refreshed!`
      );
    }, 500);
  }

  /**
   * 🛠️ INTEROPERABILITY ESCAPE HATCH:
   * If integrating with legacy 3rd party callback libraries that mutate plain
   * properties, explicitly call markForCheck() to wake up the Zoneless scheduler.
   */
  triggerManualMarkForCheck(): void {
    setTimeout(() => {
      this.plainCount++;
      this.cdr.markForCheck(); // Manually schedules view refresh in Zoneless mode
      console.log(`[Manual Override] cdr.markForCheck() scheduled view refresh!`);
    }, 500);
  }
}
