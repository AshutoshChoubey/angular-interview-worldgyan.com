/**
 * Example 01: Default vs. OnPush Change Detection
 * Angular 22 Production Architecture
 *
 * Demonstrates:
 * 1. Default (CheckAlways) top-down tree check mechanism
 * 2. OnPush (CheckOnce) subtree skipping
 * 3. Shallow reference equality pitfall (in-place mutation)
 * 4. ChangeDetectorRef APIs: markForCheck(), detectChanges(), detach() & reattach()
 */

import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  input,
  signal,
  inject,
  OnInit
} from '@angular/core';

export interface UserProfile {
  id: string;
  name: string;
  role: 'Developer' | 'Architect' | 'Lead';
}

/**
 * ---------------------------------------------------------------------------
 * COMPONENT A: OnPush with Immutable Signal Inputs
 * ---------------------------------------------------------------------------
 */
@Component({
  selector: 'app-user-card-onpush',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="user-card">
      <h3>{{ user().name }}</h3>
      <span class="role-badge">{{ user().role }}</span>
      <p>Render Count: {{ getRenderCount() }}</p>
    </div>
  `
})
export class UserCardOnPushComponent {
  // Modern Angular 22 Signal Input
  readonly user = input.required<UserProfile>();

  private renderCounter = 0;

  getRenderCount(): number {
    return ++this.renderCounter;
  }
}

/**
 * ---------------------------------------------------------------------------
 * COMPONENT B: High-Frequency Detached Component
 * Detaches from the Change Detection tree to handle 1,000 updates/sec
 * ---------------------------------------------------------------------------
 */
@Component({
  selector: 'app-ticker-detached',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="detached-ticker">
      <h4>Detached High-Frequency Ticker</h4>
      <p>Live Price: {{ currentPrice }}</p>
      <button (click)="forceManualRefresh()">Manual Refresh</button>
    </div>
  `
})
export class TickerDetachedComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);

  currentPrice = 100.0;

  ngOnInit(): void {
    // Completely detach this component from Angular's change detection tree
    this.cdr.detach();

    // High frequency stream (e.g. simulated 100 updates per second)
    setInterval(() => {
      this.currentPrice = +(100 + Math.random() * 20).toFixed(2);
      // NOTE: Because the component is detached, the UI does NOT re-render on every tick!
    }, 10);

    // Controlled refresh: only paint to UI once every 1 second (1000ms)
    setInterval(() => {
      // Manually trigger change detection only on this component subtree
      this.cdr.detectChanges();
    }, 1000);
  }

  forceManualRefresh(): void {
    // Explicit manual dirty check
    this.cdr.detectChanges();
  }
}

/**
 * ---------------------------------------------------------------------------
 * PARENT COMPONENT: Demonstrating Mutation Trap vs. Immutable Updates
 * ---------------------------------------------------------------------------
 */
@Component({
  selector: 'app-change-detection-demo',
  standalone: true,
  imports: [UserCardOnPushComponent, TickerDetachedComponent],
  template: `
    <section class="demo-container">
      <h2>Change Detection Architecture Demo</h2>

      <div class="controls">
        <button (click)="mutateInPlace()">❌ Mutate In-Place (Fails in OnPush)</button>
        <button (click)="updateImmutably()">✅ Immutable Update (Works in OnPush)</button>
      </div>

      <app-user-card-onpush [user]="currentUser()" />
      <app-ticker-detached />
    </section>
  `
})
export class ChangeDetectionDemoComponent {
  readonly currentUser = signal<UserProfile>({
    id: 'u-1',
    name: 'Ashutosh Kumar Choubey',
    role: 'Architect'
  });

  /**
   * ❌ ANTI-PATTERN: Mutating an object property in-place
   * In OnPush, the input parameter is evaluated via shallow reference equality:
   * Object.is(prevUser, currentUser()) === true.
   * Angular will NOT detect this change!
   */
  mutateInPlace(): void {
    const user = this.currentUser();
    user.name = 'Ashutosh (Mutated In-Place)';
    console.warn('Mutated in place: Memory reference identical, OnPush ignores update!');
  }

  /**
   * ✅ BEST PRACTICE: Immutable update producing a new reference
   * Object.is(prevUser, newUser) === false.
   * OnPush detects reference change and refreshes the view.
   */
  updateImmutably(): void {
    this.currentUser.update((prev) => ({
      ...prev,
      name: `Ashutosh Choubey (Updated ${new Date().toLocaleTimeString()})`
    }));
  }
}
