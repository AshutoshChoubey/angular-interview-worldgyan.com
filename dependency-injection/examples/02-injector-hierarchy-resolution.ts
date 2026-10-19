/**
 * 02-injector-hierarchy-resolution.ts
 *
 * Demonstrates:
 * 1. The Two Parallel Injector Trees: ElementInjector Tree vs EnvironmentInjector Tree.
 * 2. Bottom-up resolution traversal: Child -> Parent -> Host -> Environment -> Platform -> NullInjector.
 * 3. NullInjector sentinel error (NG0201) and optional fallback.
 * 4. Route-level EnvironmentInjectors vs Application RootEnvironmentInjector.
 */

import { Component, Injectable, InjectionToken, inject } from '@angular/core';

export const TRACE_CORRELATION_ID = new InjectionToken<string>('TRACE_CORRELATION_ID');

@Injectable({ providedIn: 'root' })
export class RootTelemetryService {
  readonly instanceId = `telemetry_${Math.random().toString(36).substring(7)}`;
  log(msg: string) {
    console.log(`[RootTelemetry ${this.instanceId}] ${msg}`);
  }
}

/**
 * Parent Shell Component providing an element-level scoped service:
 */
@Component({
  selector: 'app-shell-container',
  standalone: true,
  providers: [
    { provide: TRACE_CORRELATION_ID, useValue: 'trace_shell_9921' }
  ],
  template: `
    <div class="shell-box">
      <h2>Host Shell (Trace: {{ shellTrace }})</h2>
      <app-leaf-view></app-leaf-view>
    </div>
  `
})
export class ShellContainerComponent {
  readonly shellTrace = inject(TRACE_CORRELATION_ID);
}

/**
 * Child Leaf Component demonstrating resolution traversal:
 */
@Component({
  selector: 'app-leaf-view',
  standalone: true,
  template: `
    <div class="leaf-box">
      <p>Resolved Trace ID: {{ traceId }}</p>
      <p>Root Telemetry Instance: {{ telemetry.instanceId }}</p>
      <p>Optional Missing Token: {{ optionalToken }}</p>
    </div>
  `
})
export class LeafViewComponent {
  /**
   * Traversal Step 1:
   * Looks at LeafViewComponent's ElementInjector (not found).
   * Traversal Step 2:
   * Ascends to parent ShellContainerComponent's ElementInjector -> FOUND!
   */
  readonly traceId = inject(TRACE_CORRELATION_ID);

  /**
   * Traversal Step 1:
   * Leaf ElementInjector (not found) -> Shell ElementInjector (not found).
   * Traversal Step 2:
   * Falls through to RootEnvironmentInjector -> FOUND (providedIn: 'root')!
   */
  readonly telemetry = inject(RootTelemetryService);

  /**
   * Traversal reaches NullInjector:
   * Because { optional: true } is supplied, returns null instead of throwing NG0201.
   */
  readonly optionalToken = inject(
    new InjectionToken<string>('UNPROVIDED_SENTINEL_TOKEN'),
    { optional: true }
  );
}
