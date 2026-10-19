/**
 * 04-providers-vs-viewproviders.ts
 *
 * Demonstrates:
 * 1. The difference between providers: [] and viewProviders: [] in @Component.
 * 2. Content projection (<ng-content>) visibility boundary.
 * 3. Building reusable UI library components (Tabs, Accordions, Modals) safely.
 * 4. Preventing projected consumer markup from overriding internal state.
 */

import { Component, Injectable, inject, signal } from '@angular/core';

@Injectable()
export class AccordionInternalState {
  readonly isOpen = signal(false);
  toggle() {
    this.isOpen.update(v => !v);
  }
}

@Injectable()
export class ThemeConfigService {
  readonly brandColor = '#38bdf8';
}

/**
 * Reusable Accordion Item Component:
 * - Uses viewProviders for AccordionInternalState (HIDDEN from projected content).
 * - Uses providers for ThemeConfigService (ACCESSIBLE to projected content).
 */
@Component({
  selector: 'app-accordion-item',
  standalone: true,
  // 🛡️ viewProviders: strictly isolated to this component's own template view!
  viewProviders: [ AccordionInternalState ],
  // 🌐 providers: open to this template AND projected <ng-content> elements!
  providers: [ ThemeConfigService ],
  template: `
    <article class="accordion-box" [style.border-color]="theme.brandColor">
      <header class="accordion-header" (click)="state.toggle()">
        <h3>Accordion Header (Open: {{ state.isOpen() }})</h3>
        <button>{{ state.isOpen() ? '▲ Collapse' : '▼ Expand' }}</button>
      </header>

      <!-- Internal View Child (Can inject AccordionInternalState via viewProviders) -->
      <div class="internal-toolbar">
        <app-internal-toolbar></app-internal-toolbar>
      </div>

      <!-- Projected Content Slot -->
      <div class="accordion-body" *ngIf="state.isOpen()">
        <ng-content></ng-content>
      </div>
    </article>
  `
})
export class AccordionItemComponent {
  readonly state = inject(AccordionInternalState);
  readonly theme = inject(ThemeConfigService);
}

/**
 * Internal View Child (Inside AccordionItemComponent's template):
 */
@Component({
  selector: 'app-internal-toolbar',
  standalone: true,
  template: `<span class="pill">Internal State Connected: {{ state.isOpen() }}</span>`
})
export class InternalToolbarComponent {
  // ✅ SUCCESS: Located inside view template of AccordionItemComponent!
  readonly state = inject(AccordionInternalState);
}

/**
 * External Projected Consumer Component (Passed into <app-accordion-item> via <ng-content>):
 */
@Component({
  selector: 'app-projected-consumer',
  standalone: true,
  template: `
    <div class="projected-content">
      <p>I am projected content from the user!</p>
      <p>Theme Brand Color: {{ theme.brandColor }}</p>
      <!-- Attempting to inject AccordionInternalState here will throw NG0201! -->
    </div>
  `
})
export class ProjectedConsumerComponent {
  // ✅ SUCCESS: ThemeConfigService is registered in providers: [] -> visible to projected content!
  readonly theme = inject(ThemeConfigService);

  // ❌ If uncommented, this throws: Error: NG0201: No provider found for AccordionInternalState!
  // readonly state = inject(AccordionInternalState);
}

