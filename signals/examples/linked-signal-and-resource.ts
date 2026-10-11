import {
  Component,
  signal,
  linkedSignal,
  resource,
  rxResource,
  inject
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

/**
 * Example 7: Modern Reactive Primitives in Angular 19 – 22+
 *
 * Demonstrates:
 * 1. linkedSignal() - Dependent Writable Signal (Solves the "reset/override state" problem).
 * 2. resource() / rxResource() - Declarative Async Signal-Based Data Fetching.
 */

// ============================================================================
// 1. linkedSignal() — Dependent Writable State (Stable in Angular 22)
// ============================================================================

interface ShippingOption {
  id: string;
  label: string;
  cost: number;
}

const SHIPPING_OPTIONS: Record<string, ShippingOption[]> = {
  US: [
    { id: 'standard', label: 'Standard (3-5 days)', cost: 5 },
    { id: 'express', label: 'Express (1 day)', cost: 15 }
  ],
  IN: [
    { id: 'domestic', label: 'Speed Post (2 days)', cost: 2 },
    { id: 'same-day', label: 'Same Day Metro', cost: 8 }
  ]
};

@Component({
  selector: 'app-shipping-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h3>Country: {{ country() }}</h3>
      <button (click)="country.set('US')">Switch to US</button>
      <button (click)="country.set('IN')">Switch to India</button>

      <h4>Selected Shipping Option: {{ selectedOption().label }} (${{ selectedOption().cost }})</h4>

      <!-- User can override selection locally without breaking reactivity! -->
      <button (click)="overrideOption('express')">Select Express</button>
    </div>
  `
})
export class ShippingSelectorComponent {
  country = signal<'US' | 'IN'>('US');

  /**
   * linkedSignal maintains a reactive link to `country`.
   * When `country()` changes, it automatically re-computes and resets to default.
   * BUT unlike `computed()`, it is WRITABLE: the user can call .set() or .update()!
   */
  selectedOption = linkedSignal<ShippingOption>(() => {
    const options = SHIPPING_OPTIONS[this.country()];
    return options[0]; // Default to first option whenever country changes
  });

  overrideOption(optionId: string) {
    const options = SHIPPING_OPTIONS[this.country()];
    const chosen = options.find(o => o.id === optionId);
    if (chosen) {
      // Writable update!
      this.selectedOption.set(chosen);
    }
  }
}

// ============================================================================
// 2. resource() & rxResource() — Async Data Fetching (Stable in Angular 22)
// ============================================================================

interface UserProfile {
  id: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-user-resource-demo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <input
        type="number"
        [value]="userId()"
        (input)="onUserIdChange($event)"
        min="1"
        max="10"
      />

      <!-- Resource status signals: .isLoading(), .status(), .error() -->
      @if (userResource.isLoading()) {
        <p>Loading user data...</p>
      }

      @if (userResource.error()) {
        <p class="error">Error loading user: {{ userResource.error() }}</p>
      }

      @if (userResource.value(); as user) {
        <div>
          <h4>{{ user.name }}</h4>
          <p>Email: {{ user.email }}</p>
          <!-- Local optimistic update without re-fetching from server -->
          <button (click)="updateLocalName('Updated ' + user.name)">
            Optimistic Local Rename
          </button>
        </div>
      }
    </div>
  `
})
export class UserResourceDemoComponent {
  userId = signal<number>(1);
  private http = inject(HttpClient);

  /**
   * resource() declaratively links an input signal to an asynchronous Promise.
   * When `userId()` changes:
   * 1. Cancels previous in-flight request automatically.
   * 2. Sets .status() to 'loading'.
   * 3. Sets .value() when resolved.
   */
  userResource = resource<UserProfile, { id: number }>({
    // 1. Reactive parameters tracked
    request: () => ({ id: this.userId() }),

    // 2. Async loader function (Promise-based)
    loader: async ({ request, abortSignal }) => {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/users/${request.id}`,
        { signal: abortSignal }
      );
      if (!response.ok) throw new Error('User not found');
      return (await response.json()) as UserProfile;
    }
  });

  /**
   * rxResource() works identically for RxJS Observable streams:
   */
  rxUserResource = rxResource({
    request: () => ({ id: this.userId() }),
    loader: ({ request }) =>
      this.http.get<UserProfile>(
        `https://jsonplaceholder.typicode.com/users/${request.id}`
      )
  });

  onUserIdChange(event: Event) {
    const val = Number((event.target as HTMLInputElement).value);
    if (val > 0) this.userId.set(val);
  }

  updateLocalName(newName: string) {
    // Optimistic local update on the resource signal
    this.userResource.update(user => (user ? { ...user, name: newName } : undefined));
  }
}
