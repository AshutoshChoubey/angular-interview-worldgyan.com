/**
 * 01-inject-function-vs-constructor.ts
 *
 * Demonstrates:
 * 1. Legacy constructor parameter injection vs modern inject() API.
 * 2. Injection Context rules and field initializer benefits.
 * 3. Handling asynchronous execution boundaries with runInInjectionContext().
 * 4. TypeScript type inference and elimination of decorator metadata.
 */

import { Component, Injectable, Injector, inject, runInInjectionContext, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'architect' | 'developer';
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  readonly currentUser = signal<User | null>({
    id: 'usr_101',
    name: 'Ashutosh Kumar Choubey',
    role: 'architect'
  });

  fetchUser(id: string) {
    return this.http.get<User>(`/api/users/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  logEvent(eventName: string, payload: Record<string, unknown>) {
    console.log(`[Analytics] ${eventName}:`, payload);
  }
}

/**
 * Modern Standalone Component demonstrating inject() API:
 */
@Component({
  selector: 'app-user-profile-demo',
  standalone: true,
  template: `
    <article class="profile-card">
      <h3>User: {{ user()?.name }}</h3>
      <p>Role: {{ user()?.role }}</p>
      <button (click)="triggerAsyncAudit()">Trigger Delayed Audit</button>
    </article>
  `
})
export class UserProfileDemoComponent {
  // ✅ 1. Direct field initializer injection:
  // - Clean: No constructor parameter boilerplate
  // - Type-safe: Infers UserService automatically
  // - Inheritance-friendly: No super(userService, analytics, ...) forwarding
  private userService = inject(UserService);

  // ✅ 2. Optional injection with resolution modifier:
  private analytics = inject(AnalyticsService, { optional: true });

  // ✅ 3. Capture Injector to bridge asynchronous turns:
  private injector = inject(Injector);

  readonly user = this.userService.currentUser;

  /**
   * ⚠️ Handling Async Boundaries:
   * Calling inject() directly inside setTimeout() or Promise.then() throws NG0203.
   * runInInjectionContext() provides the active execution context to resolve dependencies dynamically.
   */
  triggerAsyncAudit() {
    this.analytics?.logEvent('audit_initiated', { timestamp: Date.now() });

    setTimeout(() => {
      runInInjectionContext(this.injector, () => {
        const http = inject(HttpClient);
        console.log('Async audit completed with dynamically resolved HttpClient:', http !== null);
      });
    }, 1000);
  }
}
