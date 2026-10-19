/**
 * 06-injection-tokens-and-factories.ts
 *
 * Demonstrates:
 * 1. Self-providing, tree-shakable InjectionToken<T> with factory.
 * 2. Provider recipes: useClass, useExisting, useValue, useFactory.
 * 3. Multi-providers (multi: true) for extensible plugin arrays.
 * 4. Lightweight Token pattern for library tree-shaking.
 */

import { Component, Injectable, InjectionToken, inject, signal } from '@angular/core';

// ---------------------------------------------------------------------------
// 1. Self-Providing, Tree-Shakable InjectionToken with Factory:
// ---------------------------------------------------------------------------
export interface ApiGatewayConfig {
  baseUrl: string;
  timeoutMs: number;
  retryAttempts: number;
}

export const API_GATEWAY_CONFIG = new InjectionToken<ApiGatewayConfig>('API_GATEWAY_CONFIG', {
  providedIn: 'root',
  factory: () => ({
    baseUrl: 'https://api.worldgyan.com/v1',
    timeoutMs: 8000,
    retryAttempts: 3
  })
});

// ---------------------------------------------------------------------------
// 2. Multi-Provider Pattern (multi: true):
// ---------------------------------------------------------------------------
export type RequestSanitizerFn = (url: string) => string;
export const REQUEST_SANITIZERS = new InjectionToken<RequestSanitizerFn[]>('REQUEST_SANITIZERS');

export const httpsUpgradeSanitizer: RequestSanitizerFn = (url) => url.replace('http://', 'https://');
export const trailingSlashSanitizer: RequestSanitizerFn = (url) => url.endsWith('/') ? url.slice(0, -1) : url;

// ---------------------------------------------------------------------------
// 3. useClass vs useExisting:
// ---------------------------------------------------------------------------
@Injectable({ providedIn: 'root' })
export class PrimaryLogger {
  log(msg: string) { console.log(`[PrimaryLogger] ${msg}`); }
}

export abstract class BaseLogger {
  abstract log(msg: string): void;
}

// ---------------------------------------------------------------------------
// 4. Lightweight Token Pattern (Optimizing Component Library Bundles):
// ---------------------------------------------------------------------------
export abstract class TabContainerToken {
  abstract selectedIndex: () => number;
}

@Component({
  selector: 'app-tab-container',
  standalone: true,
  providers: [
    // ⚡ TabContainerComponent registers itself under the abstract lightweight token:
    { provide: TabContainerToken, useExisting: TabContainerComponent }
  ],
  template: `<div class="tabs"><ng-content></ng-content></div>`
})
export class TabContainerComponent implements TabContainerToken {
  readonly selectedIndex = signal(0);
}

@Component({
  selector: 'app-tab-item',
  standalone: true,
  template: `<div [class.active]="isActive">Tab Item</div>`
})
export class TabItemComponent {
  // ⚡ TabItemComponent imports ONLY TabContainerToken, NOT the heavy TabContainerComponent!
  // This allows the bundler to aggressively tree-shake unused templates and avoid circular imports.
  private container = inject(TabContainerToken);

  get isActive(): boolean {
    return this.container.selectedIndex() === 0;
  }
}

