/**
 * 03-service-scopes-and-providers.ts
 *
 * Demonstrates:
 * 1. Root Singleton scope (providedIn: 'root') and tree-shaking mechanics.
 * 2. Platform scope (providedIn: 'platform') for Microfrontend coordination.
 * 3. Transient scope (providedIn: 'any') for per-lazy-chunk instances.
 * 4. Component scope (providers: [Service]) for view-tied instances.
 */

import { Component, Injectable, inject } from '@angular/core';

// ---------------------------------------------------------------------------
// 1. Root Singleton: Created once; shared across the whole Angular SPA
// ---------------------------------------------------------------------------
@Injectable({ providedIn: 'root' })
export class GlobalSessionService {
  readonly sessionId = crypto.randomUUID();
  readonly createdAt = new Date().toISOString();
}

// ---------------------------------------------------------------------------
// 2. Platform Singleton: Shared across multiple Angular apps in same DOM
// ---------------------------------------------------------------------------
@Injectable({ providedIn: 'platform' })
export class CrossAppSharedBus {
  private listeners = new Set<(event: string) => void>();

  publish(event: string) {
    this.listeners.forEach(cb => cb(event));
  }

  subscribe(cb: (event: string) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }
}

// ---------------------------------------------------------------------------
// 3. Transient Scope: Singleton in eager code; new instance per lazy chunk
// ---------------------------------------------------------------------------
@Injectable({ providedIn: 'any' })
export class RouteAuditLogger {
  readonly routeSessionId = crypto.randomUUID();
  logAudit(action: string) {
    console.log(`[RouteAudit ${this.routeSessionId}] ${action}`);
  }
}

// ---------------------------------------------------------------------------
// 4. Component-Scoped Service: Dedicated instance per component DOM lifecycle
// ---------------------------------------------------------------------------
@Injectable() // Not provided in root!
export class FormDraftService {
  readonly draftId = `draft_${Math.random().toString(36).substring(7)}`;
  private fields = new Map<string, string>();

  saveField(name: string, value: string) {
    this.fields.set(name, value);
  }

  getField(name: string): string | undefined {
    return this.fields.get(name);
  }
}

@Component({
  selector: 'app-contact-form-widget',
  standalone: true,
  // ⚡ Each <app-contact-form-widget> gets its own isolated FormDraftService instance!
  providers: [ FormDraftService ],
  template: `
    <form class="widget-form">
      <h4>Draft Session: {{ draft.draftId }}</h4>
      <input #inp (input)="draft.saveField('name', inp.value)" placeholder="Your Name" />
      <p>Global Session: {{ session.sessionId }}</p>
    </form>
  `
})
export class ContactFormWidgetComponent {
  readonly draft = inject(FormDraftService);
  readonly session = inject(GlobalSessionService);
}
