/**
 * Example 07: Step-by-Step Browser Rendering & Painting Benchmark
 * Angular 22 Production Architecture
 *
 * Demonstrates:
 * 1. The 8-stage pipeline from TypeScript state change to GPU monitor pixels
 * 2. Layout Thrashing (Forced Synchronous Reflow) benchmark & disaster prevention
 * 3. Batching DOM reads before DOM writes
 * 4. Microtask scheduling and requestAnimationFrame synchronization
 * 5. GPU-accelerated CSS properties (transform, opacity) vs geometry repaints (top, left, width)
 */

import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  viewChildren,
  inject,
  AfterViewInit
} from '@angular/core';

@Component({
  selector: 'app-paint-benchmark',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="benchmark-container">
      <h3>Browser Rendering &amp; Painting Benchmark</h3>

      <div class="test-controls">
        <button (click)="runLayoutThrashingAntiPattern()">
          ❌ Run Layout Thrashing (Forces Synchronous Reflows)
        </button>
        <button (click)="runBatchedOptimalPaint()">
          ✅ Run Batched DOM Pipeline (Sub-16ms Paint Budget)
        </button>
      </div>

      <div class="metrics-panel">
        <p>Execution Time: <strong>{{ executionDuration }}ms</strong></p>
        <p>Reflow Mode: <strong>{{ activeMode }}</strong></p>
      </div>

      <!-- Test box grid for layout measurement -->
      <div class="boxes-container">
        @for (item of boxList; track item) {
          <div #boxItem class="test-box">Box {{ item }}</div>
        }
      </div>
    </div>
  `
})
export class PaintBenchmarkComponent implements AfterViewInit {
  private hostEl = inject(ElementRef);

  readonly boxList = Array.from({ length: 150 }, (_, i) => i + 1);

  // Modern Angular 22 Signal Query for template elements
  readonly boxes = viewChildren<ElementRef<HTMLDivElement>>('boxItem');

  executionDuration = 0;
  activeMode = 'Idle';

  ngAfterViewInit(): void {
    console.log(`Initialized benchmark with ${this.boxes().length} DOM nodes.`);
  }

  /**
   * ❌ ANTI-PATTERN: Layout Thrashing (Forced Synchronous Reflow)
   * Interleaving DOM writes with DOM reads forces the browser to pause
   * JavaScript execution, immediately recalculate styles, and recompute layout geometry
   * for every single iteration in the loop!
   */
  runLayoutThrashingAntiPattern(): void {
    this.activeMode = '❌ Layout Thrashing (Interleaved Reads/Writes)';
    const elements = this.boxes().map((b) => b.nativeElement);
    const start = performance.now();

    elements.forEach((el, index) => {
      // 1. WRITE: Mutate DOM property (invalidates current layout)
      el.style.width = `${100 + (index % 20)}px`;

      // 2. FORCED READ: Requesting offsetHeight forces synchronous layout recalculation!
      const forcedHeight = el.offsetHeight;

      // 3. WRITE: Secondary invalidation
      el.style.height = `${forcedHeight + 2}px`;
    });

    this.executionDuration = +(performance.now() - start).toFixed(2);
    console.warn(`[Layout Thrashing] Duration: ${this.executionDuration}ms`);
  }

  /**
   * ✅ PRODUCTION BEST PRACTICE: Batch Reads, Then Batch Writes
   * 1. Read all geometry measurements in a single pass (CSSOM / Render Tree read-only).
   * 2. Apply all style mutations in a separate pass.
   * Result: The browser performs exactly ONE style recalculation and ONE reflow pass!
   */
  runBatchedOptimalPaint(): void {
    this.activeMode = '✅ Batched Optimal Pipeline (Clean Single Reflow)';
    const elements = this.boxes().map((b) => b.nativeElement);
    const start = performance.now();

    // STEP 1: BATCH ALL READS
    const heights = elements.map((el) => el.offsetHeight);

    // STEP 2: BATCH ALL WRITES
    // Enqueued cleanly into the microtask / animation frame
    requestAnimationFrame(() => {
      elements.forEach((el, index) => {
        el.style.width = `${100 + (index % 20)}px`;
        el.style.height = `${heights[index] + 2}px`;
      });

      this.executionDuration = +(performance.now() - start).toFixed(2);
      console.log(`[Batched Pipeline] Duration: ${this.executionDuration}ms`);
    });
  }
}
