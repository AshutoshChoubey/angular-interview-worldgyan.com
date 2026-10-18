/**
 * Example 03: Signal-Driven Change Detection & The Push-Pull Reactive Graph
 * Angular 22 Production Architecture
 *
 * Demonstrates:
 * 1. Push Phase: Producer marks downstream Consumer nodes dirty without eager calculation
 * 2. Pull Phase: Template Consumer lazily evaluates computed signals on demand
 * 3. Glitch-Free Diamond Problem Resolution (epoch versioning)
 * 4. untracked() boundary to prevent accidental dependency subscriptions
 */

import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  effect,
  untracked
} from '@angular/core';

@Component({
  selector: 'app-diamond-reactive-graph',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="graph-card">
      <h3>Push-Pull Reactive Graph &amp; Diamond Problem Resolution</h3>

      <div class="metrics-grid">
        <div><strong>Root (A):</strong> {{ count() }}</div>
        <div><strong>Branch 1 (B - Is Even):</strong> {{ isEven() }}</div>
        <div><strong>Branch 2 (C - Double):</strong> {{ doubleCount() }}</div>
        <div><strong>Summary (D - Combined):</strong> {{ summary() }}</div>
      </div>

      <div class="eval-metrics">
        <p>Evaluation Count for Summary (D): <strong>{{ summaryEvaluationCount }}</strong></p>
      </div>

      <div class="controls">
        <button (click)="increment()">Increment Count</button>
        <button (click)="incrementWithUntrackedLog()">Increment with Untracked Logging</button>
      </div>
    </div>
  `
})
export class DiamondReactiveGraphComponent {
  // NODE A: Root Producer
  readonly count = signal(0);

  // NODE B: Dependent Computation 1
  readonly isEven = computed(() => this.count() % 2 === 0);

  // NODE C: Dependent Computation 2
  readonly doubleCount = computed(() => this.count() * 2);

  summaryEvaluationCount = 0;

  /**
   * NODE D: Diamond Junction Consumer
   * Depends on both Branch B (isEven) and Branch C (doubleCount), which both depend on Root A.
   *
   * In naive reactive systems, when A updates:
   * 1. A changes -> B updates -> triggers D (with new B and OLD C!) -> GLITCH!
   * 2. A changes -> C updates -> triggers D (with new B and NEW C)
   * Result: D evaluates twice and briefly observes an inconsistent intermediate state!
   *
   * Angular 22 Signals Algorithm:
   * Push Phase: When A changes, dirty flags are stamped down to B, C, and D.
   * Pull Phase: When D is read by the template, it topologically evaluates B and C first,
   * then computes D EXACTLY ONCE with 100% synchronized inputs!
   */
  readonly summary = computed(() => {
    this.summaryEvaluationCount++;
    const evenStr = this.isEven() ? 'EVEN' : 'ODD';
    const dbl = this.doubleCount();
    return `Count is ${evenStr} (Double = ${dbl})`;
  });

  constructor() {
    // Side effect listening to summary
    effect(() => {
      console.log(`[Signal Graph Effect] Summary changed to: "${this.summary()}"`);
    });
  }

  increment(): void {
    this.count.update((c) => c + 1);
  }

  /**
   * Reading a signal without making the caller depend on it: untracked()
   */
  incrementWithUntrackedLog(): void {
    this.count.update((c) => c + 1);

    // Reading without reactive dependency tracking
    const currentVal = untracked(() => this.count());
    console.log(`[Untracked Read] Successfully logged value: ${currentVal}`);
  }
}
