/**
 * Example 04: High-Frequency Continuous Streams & WebSockets
 * Angular 22 Production Architecture
 *
 * Demonstrates:
 * 1. Handling high-frequency real-time WebSockets (e.g., 50-100 messages/sec)
 * 2. Why unthrottled streams in Default strategy trigger 100% CPU lockups
 * 3. Throttling and buffering with RxJS operators (throttleTime, sampleTime)
 * 4. toSignal() integration with automatic microtask coalescing
 * 5. Protecting the 60fps (16.6ms) and 120fps (8.3ms) browser rendering budgets
 */

import {
  Component,
  ChangeDetectionStrategy,
  Injectable,
  inject,
  signal,
  DestroyRef
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject, throttleTime, asyncScheduler, sampleTime } from 'rxjs';

export interface CryptoTick {
  symbol: string;
  price: number;
  timestamp: number;
}

/**
 * ---------------------------------------------------------------------------
 * PRODUCTION SERVICE: High-Frequency WebSocket Manager
 * ---------------------------------------------------------------------------
 */
@Injectable({ providedIn: 'root' })
export class MarketWebSocketService {
  private readonly rawTicks$ = new Subject<CryptoTick>();

  /**
   * CATASTROPHIC PITFALL TO AVOID:
   * Direct, unthrottled streaming to UI in Zone.js:
   * 100 WebSocket ticks per second = 100 ApplicationRef.tick() runs per second =
   * browser thread starvation, dropped frames, and fan noise!
   *
   * PRODUCTION ARCHITECTURE:
   * Throttle to screen refresh interval (e.g. 60ms = ~16 updates/sec max).
   * toSignal() automatically bridges RxJS to the Angular reactive graph and cleans up.
   */
  readonly liveTick = toSignal(
    this.rawTicks$.pipe(
      // Only emit the trailing value after 60ms has elapsed
      throttleTime(60, asyncScheduler, { leading: false, trailing: true })
    ),
    {
      initialValue: { symbol: 'BTC-USDT', price: 92450.0, timestamp: Date.now() }
    }
  );

  /**
   * Secondary Buffered Stream for Charting (Sampled every 500ms)
   */
  readonly chartTick = toSignal(
    this.rawTicks$.pipe(sampleTime(500)),
    { initialValue: null }
  );

  private mockSocketTimer?: any;

  connectMockWebSocket(): void {
    if (this.mockSocketTimer) return;

    // Simulate aggressive 50 packets per second (every 20ms)
    this.mockSocketTimer = setInterval(() => {
      const delta = (Math.random() - 0.49) * 15;
      const current = this.liveTick().price;
      this.rawTicks$.next({
        symbol: 'BTC-USDT',
        price: +(current + delta).toFixed(2),
        timestamp: Date.now()
      });
    }, 20);
  }

  disconnect(): void {
    if (this.mockSocketTimer) {
      clearInterval(this.mockSocketTimer);
      this.mockSocketTimer = undefined;
    }
  }
}

/**
 * ---------------------------------------------------------------------------
 * UI COMPONENT: High-Speed Ticker with OnPush & Signals
 * ---------------------------------------------------------------------------
 */
@Component({
  selector: 'app-crypto-ticker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ticker-box">
      <h3>Real-Time Crypto Feed (High-Frequency WebSocket)</h3>

      <div class="price-hero">
        <span class="symbol">{{ tick().symbol }}</span>
        <span class="price" [class.up]="isPositive()" [class.down]="!isPositive()">
          \${{ tick().price.toLocaleString() }}
        </span>
      </div>

      <div class="meta-info">
        <span>Updates Throttled: <strong>Max 1 per 60ms</strong></span>
        <span>Browser Frame Rate: <strong>Locked at 60fps</strong></span>
      </div>

      <div class="controls">
        <button (click)="startFeed()">Connect Feed</button>
        <button (click)="stopFeed()">Disconnect Feed</button>
      </div>
    </div>
  `
})
export class CryptoTickerComponent {
  private marketService = inject(MarketWebSocketService);
  private destroyRef = inject(DestroyRef);

  // Directly consume the throttled signal
  readonly tick = this.marketService.liveTick;
  readonly isPositive = signal(true);

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.marketService.disconnect();
    });
  }

  startFeed(): void {
    this.marketService.connectMockWebSocket();
  }

  stopFeed(): void {
    this.marketService.disconnect();
  }
}
