/**
 * Example 06: View Encapsulation & CSS Scoping Rules
 * Angular 22 Production Architecture
 *
 * Demonstrates:
 * 1. ViewEncapsulation.Emulated (Default attribute-based scoping)
 * 2. ViewEncapsulation.ShadowDom (Native Web Component Shadow Root)
 * 3. ViewEncapsulation.None (Global head stylesheet injection)
 * 4. The Golden CSS Scoping Rules: Parent-to-Child & Child-to-Parent isolation
 * 5. Host styling with :host and :host-context()
 * 6. Why ::ng-deep is deprecated and replaced with CSS Custom Properties
 */

import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy
} from '@angular/core';

/**
 * ---------------------------------------------------------------------------
 * CHILD COMPONENT: Emulated View Encapsulation
 * ---------------------------------------------------------------------------
 */
@Component({
  selector: 'app-child-card',
  standalone: true,
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    /* Scoped by Angular compiler to: :host[_nghost-c2] */
    :host {
      display: block;
      padding: 16px;
      border: 1px solid #1e293b;
      border-radius: 8px;
      /* Consumes CSS custom property passed down from parent */
      background: var(--card-bg-theme, #090e1c);
    }

    /* Scoped to: p[_ngcontent-c2] */
    p {
      color: #94a3b8;
      font-size: 14px;
    }

    .badge {
      /* Uses dynamic theme color injected from parent */
      color: var(--accent-color, #38bdf8);
      font-weight: 700;
    }
  `],
  template: `
    <div class="card-inner">
      <span class="badge">CHILD COMPONENT</span>
      <p>I am inside the Child Component. My text is #94a3b8.</p>
    </div>
  `
})
export class ChildCardComponent {}

/**
 * ---------------------------------------------------------------------------
 * PARENT COMPONENT: Demonstrating Parent-to-Child CSS Scoping Isolation
 * ---------------------------------------------------------------------------
 */
@Component({
  selector: 'app-parent-view',
  standalone: true,
  imports: [ChildCardComponent],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    /* 
     * Scoped to: p[_ngcontent-c1]
     * 
     * QUESTION: Will this turn the child's <p> tags red?
     * ANSWER: NO!
     * Angular rewrites this selector to: p[_ngcontent-c1].
     * The child's <p> tags carry attribute [_ngcontent-c2].
     * Because the attribute does not match, parent CSS NEVER affects child elements!
     */
    p {
      color: #f43f5e; /* Crimson Red */
      font-weight: bold;
    }

    /*
     * ✅ MODERN ENTERPRISE SOLUTION FOR CHILD CUSTOMIZATION:
     * Instead of the deprecated ::ng-deep, declare CSS variables on the host!
     * CSS custom properties naturally pierce shadow boundaries and emulated scopes!
     */
    :host {
      --card-bg-theme: #0f1d38;
      --accent-color: #34d399; /* Emerald Green */
    }
  `],
  template: `
    <div class="parent-container">
      <h2>Parent Component (Emulated Encapsulation)</h2>
      <p>Parent paragraph: I am CRIMSON RED (#f43f5e) because of parent scoped styles.</p>

      <!-- Child Component rendered here -->
      <app-child-card />
    </div>
  `
})
export class ParentViewComponent {}

/**
 * ---------------------------------------------------------------------------
 * SHADOW DOM COMPONENT: Native Web Component Isolation
 * ---------------------------------------------------------------------------
 */
@Component({
  selector: 'app-shadow-widget',
  standalone: true,
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    /* Truly isolated by browser shadow root. External styles cannot enter. */
    :host {
      display: block;
      all: initial; /* Resets all browser styles inside shadow root */
      font-family: sans-serif;
      color: #ffffff;
      background: #000000;
      padding: 12px;
    }
  `],
  template: `
    <div>
      <h4>Native Shadow DOM Boundary</h4>
      <p>Global CSS resets or Bootstrap/Tailwind utility classes cannot penetrate this node.</p>
    </div>
  `
})
export class ShadowWidgetComponent {}
