import {
  Component,
  signal,
  effect,
  inject,
  Injector,
  runInInjectionContext
} from '@angular/core';

/**
 * Example 3: Effects & Resource Cleanup
 * Covers: effect(), onCleanup(), injection context rules, manual injector
 */

@Component({
  selector: 'app-user-tracker',
  standalone: true,
  template: `
    <div>
      <h3>Active User: {{ activeUserId() }}</h3>
      <button (click)="switchUser('user-101')">Switch to User 101</button>
      <button (click)="switchUser('user-202')">Switch to User 202</button>
    </div>
  `
})
export class UserTrackerComponent {
  activeUserId = signal<string>('user-101');
  private injector = inject(Injector);

  constructor() {
    // 1. Basic Effect with onCleanup
    effect((onCleanup) => {
      const userId = this.activeUserId();
      console.log(`[Effect] Connecting WebSocket for user: ${userId}`);

      const connection = {
        id: userId,
        close: () => console.log(`[Cleanup] Closed WebSocket connection for ${userId}`)
      };

      // Cleanup called before re-execution or upon component destruction
      onCleanup(() => {
        connection.close();
      });
    });

    // 2. Syncing state to LocalStorage
    effect(() => {
      localStorage.setItem('last_active_user', this.activeUserId());
    });
  }

  // 3. Creating effect outside constructor (requires explicit injector)
  setupDelayedEffect() {
    runInInjectionContext(this.injector, () => {
      effect(() => {
        console.log(`[Delayed Effect] Current User: ${this.activeUserId()}`);
      });
    });
  }

  switchUser(id: string) {
    this.activeUserId.set(id);
  }
}
