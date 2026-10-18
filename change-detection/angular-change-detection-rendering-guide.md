---
title: "Angular 22 Change Detection, View Encapsulation & Browser Painting Pipeline: Default vs OnPush, Zoneless Signals, WebSockets, CSS Scoping & DOM Rendering"
description: "A complete, notes-first architectural masterclass on Angular 22 Change Detection: Default vs OnPush, Zoneless provideZonelessChangeDetection, Signal reactive graph, high-frequency WebSockets, unsubscription patterns, component communication, ViewEncapsulation (Emulated, ShadowDom, None) CSS scoping rules, and step-by-step browser paint lifecycle."
category: "Frontend Architecture"
author: "Ashutosh Kumar Choubey"
publishedAt: "2026-10-18"
updatedAt: "2026-10-18"
difficulty: "Advanced"
featured: true
draft: false
tags:
  - "Angular"
  - "Angular 22"
  - "Change Detection"
  - "OnPush"
  - "Zoneless"
  - "Signals"
  - "View Encapsulation"
  - "Shadow DOM"
  - "Browser Rendering"
  - "Performance"
learningObjectives:
  - "Master ChangeDetectionStrategy.Default vs OnPush and how Angular dirty checks component trees"
  - "Architect Zoneless Angular 22 applications with provideZonelessChangeDetection and Signal reactivity"
  - "Tame high-frequency WebSockets and continuous Observable streams without 60fps frame drops"
  - "Implement modern Angular 22 component communication: signal inputs, outputs, and sibling services"
  - "Understand ViewEncapsulation (Emulated, ShadowDom, None) and exact parent-to-child CSS scoping rules"
  - "Trace the step-by-step browser rendering pipeline: JavaScript execution to GPU paint and composite"
prerequisites:
  - "Solid understanding of Angular components, TypeScript, and modern browser rendering concepts"
---

# Angular 22 Change Detection, View Encapsulation & Browser Painting Pipeline Notes

> **Core Philosophy:** In modern Angular 22, Change Detection has evolved from a brute-force, top-down tree sweep driven by `zone.js` monkey-patching into an ultra-fast, fine-grained reactive push-pull graph powered by **Signals** and **Zoneless microtask scheduling** (`provideZonelessChangeDetection()`). Understanding how Angular evaluates bindings, scopes CSS styles via `ViewEncapsulation`, and synchronizes with the browser's layout and paint lifecycle is the defining hallmark of a Senior and Principal Frontend Architect.

---

## 1. 60-Second Executive Cheat Sheet

| Architectural Concern / Strategy | Legacy Angular (< v16) | Modern Angular 22 (v16–v22+) | Under the Hood & Performance Impact |
| :--- | :--- | :--- | :--- |
| **CD: Default (CheckAlways)** | `ChangeDetectionStrategy.Default` | Used only for legacy interop | `zone.js` monkey-patches all async turns $\to$ invokes `ApplicationRef.tick()` $\to$ sweeps entire component tree from `<app-root>` down to leaves, re-checking every expression $O(N)$. Checks twice in dev mode. |
| **CD: OnPush (CheckOnce)** | Manual `cdRef.markForCheck()` | `ChangeDetectionStrategy.OnPush` + Signals | Prunes component subtree from dirty checking sweeps. Evaluated **only** when: 1) input references change, 2) component template DOM events fire, 3) `\| async` emits, 4) signal read in template changes, or 5) manual mark. |
| **CD: Detached (Manual)** | `ChangeDetectorRef.detach()` | `cdRef.detach()` & `cdRef.reattach()` | Completely disconnects component from change detection tree. Angular will **never** check this component automatically. Ideal for 60fps canvas, WebGL, and 1,000 WebSocket packets/sec via `cdRef.detectChanges()`. |
| **CD: Zoneless Scheduler** | `zone.js` required in polyfills | `provideZonelessChangeDetection()` | Removes ~15kB bundle polyfill. Eliminates full-tree dirty sweeps on untargeted async events (timers, analytics). Native microtask scheduler wakes up only for reactive Signal dirty notifications $O(1)$. |
| **Encapsulation: Emulated** | `ViewEncapsulation.Emulated` (Default) | `ViewEncapsulation.Emulated` (Default) | Angular rewrites component CSS rules by appending unique attributes `_nghost-ng-c*` and `_ngcontent-ng-c*`. Scopes component CSS to its own template only; parent styles never leak into child elements. |
| **Encapsulation: ShadowDom** | Deprecated `Native` | `ViewEncapsulation.ShadowDom` | Attaches a native browser Shadow Root (`attachShadow({ mode: 'open' })`). True hardware-grade encapsulation: global page CSS cannot penetrate (only CSS Custom Properties pass through). Component CSS cannot escape. |
| **Encapsulation: None** | `ViewEncapsulation.None` | `ViewEncapsulation.None` | Zero scoping attributes generated. Angular injects component styles directly into document `<head>` inside a `<style>` block. Styles become 100% global across the entire DOM tree. |
| **Reactivity Primitive** | `BehaviorSubject` / `EventEmitter` | `signal()`, `computed()`, `input()`, `output()` | Push-pull dependency graph with topological epoch counters; glitch-free Diamond Problem resolution; $O(1)$ targeted dirty notification. |
| **High-Frequency Streams** | `ngZone.runOutsideAngular()` + manual `detectChanges()` | `toSignal(stream$.pipe(throttleTime(60)))` | Batches continuous events (e.g., 50/sec WebSockets) into human visual perception frames (16ms/60ms) without frame drops or 100% CPU lockup. |
| **Observable Cleanup** | `ngOnDestroy` + `takeUntil(destroy$)` | `takeUntilDestroyed()` or `toSignal()` | Automated unsubscription tied to `DestroyRef`; guarantees zero memory leaks or orphaned subscriptions. |
| **Component Communication** | `@Input()` / `@Output() EventEmitter` | `input()`, `output()`, Shared Signal Service | Type-safe signal inputs/outputs; sibling components communicate seamlessly via root signal stores without parent prop-drilling. |
| **Browser Painting Budget** | Top-down dirty check triggers DOM reflows | Microtask batching $\to$ Ivy DOM patch $\to$ GPU composite | Ivy patches only changed DOM nodes. Minimizes browser layout thrashing; maximizes 60fps/120fps display frame budgets. |

---

## 2. Change Detection Strategies: Default vs OnPush

Angular’s change detection mechanism determines **when** and **how** data updates in your TypeScript classes reflect in the browser DOM.

```
       [ApplicationRef.tick()]
                 │
                 ▼
          [<app-root>]
          /          \
     [Header]      [Dashboard] (OnPush)
      /      \          │  (Skipped if not dirty!)
   [User]   [Nav]    [Table]
```

### 2.1 `ChangeDetectionStrategy.Default` (CheckAlways)
- **How it works:** Whenever any asynchronous event fires inside the browser (DOM click, `setTimeout`, `fetch` response, WebSocket message), `zone.js` triggers a microtask that runs `ApplicationRef.tick()`. Angular traverses the **entire component tree from `<app-root>` down to the deepest leaf**, re-evaluating every template expression.
- **Dirty Checking Algorithm:** Compares current expression value with previous value via strict equality (`===`). If different, updates DOM node.
- **Development Mode Double-Check:** Angular runs change detection **twice** in development mode. If a value changes between the first and second pass, Angular throws the dreaded:
  ```
  ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked.
  Previous value: 'Ashutosh'. Current value: 'Choubey'.
  ```
- **Architectural Weakness:** As applications scale to hundreds of components, checking every binding on every mouse movement or background interval wastes CPU cycles and drops frame rates.

### 2.2 `ChangeDetectionStrategy.OnPush` (CheckOnce)
- **How it works:** Tells Angular: *"Do NOT check this component or its children unless it is explicitly marked dirty."*
- **The 5 Triggers that Mark OnPush Dirty:**
  1. **Input Reference Change:** An `@Input()` or `input()` signal receives a **new object reference** (`Object.is(prev, curr) === false`). Mutating an existing object in-place does **not** trigger change detection!
  2. **Template Event Listener:** A DOM event originates from within the component's own template (e.g., `(click)="save()"`). (Note: Global listeners on `window` or `document` do *not* automatically mark OnPush dirty).
  3. **Async Pipe Emission:** An `Observable` bound via `| async` emits a new value (internally invokes `ChangeDetectorRef.markForCheck()`).
  4. **Signal Read in View:** A `signal()` or `computed()` read in the component template updates its value.
  5. **Manual Dirty Marking:** Explicit call to `ChangeDetectorRef.markForCheck()` or `ChangeDetectorRef.detectChanges()`.

```typescript
// Production Comparison: Mutating in-place vs Immutable State
@Component({
  selector: 'app-user-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div>{{ user().name }} ({{ user().role }})</div>`
})
export class UserProfileComponent {
  // Signal Input (Angular 22)
  readonly user = input.required<{ name: string; role: string }>();

  // ❌ ANTI-PATTERN (Will NOT trigger view update in OnPush):
  // this.user().name = "Ashutosh"; // In-place mutation!

  // ✅ PRODUCTION BEST PRACTICE (Immutable reference):
  // Updates signal or emits new object: { ...this.user(), name: "Ashutosh" }
}
```

### 2.3 `ChangeDetectorRef.detach()` vs `markForCheck()` vs `detectChanges()`
- **`markForCheck()`:** Marks the current component and all its ancestor components up to the root as dirty (`CheckOnce`). The view is re-rendered during the *next* change detection cycle.
- **`detectChanges()`:** Synchronously triggers change detection on the current component and its immediate children *immediately*, without waiting for the global scheduler.
- **`detach()` & `reattach()`:** Completely disconnects the component from the change detection tree. Ideal for canvas rendering, 3D WebGL charts, or processing 1,000 WebSocket packets per second where you manually control updates.

---

## 3. Zone.js vs Zoneless Change Detection (`provideZonelessChangeDetection`)

### 3.1 How Zone.js Works Under the Hood
`zone.js` creates an execution context that monkey-patches browser asynchronous APIs:
```javascript
// Simplified mental model of Zone.js monkey patching
const originalSetTimeout = window.setTimeout;
window.setTimeout = function(callback, delay) {
  return originalSetTimeout(() => {
    // 1. Execute developer callback
    callback();
    // 2. Notify Angular Zone
    ngZone.onMicrotaskEmpty.emit(); // Triggers ApplicationRef.tick()
  }, delay);
};
```
While convenient, this model has severe drawbacks:
1. **~15kB min+gzip overhead** in every bundle.
2. **Opaque stack traces** with multiple layers of `ZoneDelegate.invokeTask()`.
3. **Over-checking:** A background timer or third-party analytics script triggers a full-tree dirty check sweep across the entire application.

### 3.2 Modern Zoneless in Angular 22
With `provideZonelessChangeDetection()`, Angular completely ditches `zone.js`:
```typescript
// src/app/app.config.ts
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(), // Removes zone.js entirely!
    provideRouter(routes)
  ]
};
```

In `angular.json`, the polyfills configuration becomes an empty array:
```json
"polyfills": []
```

### 3.3 The Critical Zoneless Rule & Gotcha
In Zoneless mode, **Angular does not intercept asynchronous APIs**. If you write:
```typescript
// ⚠️ PITFALL IN ZONELESS MODE:
@Component({
  standalone: true,
  template: `<p>Count: {{ count }}</p>`
})
export class CounterComponent {
  count = 0; // Standard non-reactive property

  constructor() {
    setTimeout(() => {
      this.count++; // ❌ In Zoneless, this will NEVER update the UI!
    }, 1000);
  }
}
```
**Why?** In Zoneless mode, Angular has no monkey-patched `setTimeout` to notify it that state changed.

**The Solution:** Use **Signals** or **`ChangeDetectorRef.markForCheck()`**:
```typescript
// ✅ MODERN ANGULAR 22 SOLUTION:
@Component({
  standalone: true,
  template: `<p>Count: {{ count() }}</p>`
})
export class CounterComponent {
  readonly count = signal(0); // Reactive signal

  constructor() {
    setTimeout(() => {
      this.count.update(c => c + 1); // ✅ Notifies Angular's reactive scheduler automatically!
    }, 1000);
  }
}
```

---

## 4. Signal-Driven Change Detection: The Reactive Graph

Signals are not just a state-management utility; they are the **engine of Angular 22 change detection**.

```
[Signal: count (Producer)] ──(Push: dirty notification)──> [Template Consumer]
           ▲                                                        │
           │                                                        ▼
   (count.set(5))                                         [Scheduled Microtask]
                                                                    │
                                                           (Pull: reads 5)
                                                                    ▼
                                                             [DOM Text Node]
```

### 4.1 Push-Pull Reactive Algorithm
Angular’s signal implementation operates on a two-phase **Push-Pull** model:
1. **Push Phase (Notification):** When a writable signal updates (`count.set(5)`), it immediately pushes a lightweight "stale/dirty" flag downstream to all dependent `computed()` nodes and template view consumers. **No expressions are recomputed yet.**
2. **Pull Phase (Evaluation):** When Angular’s microtask scheduler renders the view, the template consumer lazily pulls the latest value from the signal graph. Computations are evaluated only once, memoized, and cached until their dependencies change.

### 4.2 Glitch-Free Diamond Problem Resolution
In naive reactive systems, diamond dependencies cause intermediate invalid states:
```
       [A: count]
       /        \
  [B: isEven]  [C: double]
       \        /
       [D: status]
```
If `A` changes, naive systems might evaluate `D` with a new `B` and an old `C`. Angular’s signal graph uses topological epoch counters to guarantee that `D` runs **exactly once** with synchronized values, preventing visual glitches and unnecessary re-renders.

---

## 5. Async Events, Timers & Continuous WebSockets

### 5.1 What Happens with `setTimeout` & `setInterval`?
- **In Default + Zone.js:** Every timer tick invokes `ApplicationRef.tick()`, sweeping every component in the tree.
- **In OnPush + Zone.js:** The timer tick triggers a tree sweep, but skips OnPush components unless they were explicitly marked dirty.
- **In Zoneless:** Timer callbacks run silently. They only cause a render if they update a Signal or invoke `markForCheck()`.

### 5.2 Taming Continuous High-Frequency WebSockets (e.g. 50 packets/sec)
When connecting to real-time financial tickers, IoT sensors, or chat streams, incoming data arrives faster than the 60fps (16.6ms) screen refresh rate:

```typescript
// ❌ CATASTROPHIC PITFALL: Triggering CD on every packet in Default strategy
// 50 packets/sec = 50 full DOM tree traversals/sec = 100% CPU lockup!

// ✅ PRODUCTION ARCHITECTURE: Buffer / Throttle + Signal
@Injectable({ providedIn: 'root' })
export class MarketFeedService {
  private readonly rawPrices$ = new Subject<number>();

  // Throttle to screen refresh budget (e.g., max 1 update per 60ms)
  readonly price = toSignal(
    this.rawPrices$.pipe(
      throttleTime(60, asyncScheduler, { leading: false, trailing: true })
    ),
    { initialValue: 0 }
  );

  connect(wsUrl: string) {
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.rawPrices$.next(data.price);
    };
  }
}
```
**Architectural Benefit:** Regardless of whether the backend pushes 50 or 500 messages per second, the UI updates at most once every 60ms, batching DOM repaints and keeping the browser thread responsive.

---

## 6. Observables & Change Detection: AsyncPipe vs Unsubscribe Patterns

### 6.1 What Happens when an Observable Continuously Emits?
1. **With `| async` Pipe:**
   - Subscribes in `transform()`.
   - Calls `markForCheck()` on every emission, marking the component dirty.
   - Automatically calls `.unsubscribe()` in `ngOnDestroy()`. Zero memory leaks.
2. **With Manual `.subscribe()`:**
   - If in `OnPush`, assigning `this.data = val` does **not** update the UI! You must manually inject `ChangeDetectorRef` and call `this.cdr.markForCheck()`.
   - If you do not unsubscribe, the subscription remains alive indefinitely, leaking memory and preventing the component instance from being garbage collected.

### 6.2 Modern Angular 22 Unsubscription Standards

```typescript
// Pattern 1: toSignal() — The Recommended Modern Approach
@Component({
  standalone: true,
  template: `<div>{{ user()?.name }}</div>`
})
export class ModernUserComponent {
  private userService = inject(UserService);
  // toSignal automatically handles subscription & unsubscription on destroy!
  readonly user = toSignal(this.userService.currentUser$, { initialValue: null });
}

// Pattern 2: takeUntilDestroyed() for imperative pipelines
@Component({ ... })
export class ImperativeComponent {
  private destroyRef = inject(DestroyRef);
  private dataService = inject(DataService);

  ngOnInit() {
    this.dataService.stream$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((val) => {
        // Safe from leaks!
      });
  }
}
```

---

## 7. Component Communication Patterns in Angular 22

```
      [Parent Component]
        │              ▲
input() │              │ output()
        ▼              │
      [Child Component]

      [Sibling A] ◄───[Shared Signal Service]───► [Sibling B]
```

### 7.1 Parent to Child: Signal `input()`
```typescript
@Component({
  selector: 'app-child',
  standalone: true,
  template: `<h3>{{ title() }} - Score: {{ score() }}</h3>`
})
export class ChildComponent {
  // Required Signal Input
  readonly title = input.required<string>();
  // Optional Signal Input with Default & Transform
  readonly score = input<number, string>(0, {
    transform: (v: string | number) => Number(v) || 0
  });
}
```

### 7.2 Child to Parent: Signal `output()`
```typescript
@Component({
  selector: 'app-child',
  standalone: true,
  template: `<button (click)="emitDelete()">Delete</button>`
})
export class ChildComponent {
  readonly deleteRequested = output<string>();

  emitDelete() {
    this.deleteRequested.emit('item-42');
  }
}
```

### 7.3 Sibling / Adjacent Components: Shared Signal Service
When components share no direct parent-child relationship (e.g. Sidebar and Main Content, or Modal and Header):

```typescript
// state/cart-state.service.ts
@Injectable({ providedIn: 'root' })
export class CartStateService {
  private readonly _items = signal<CartItem[]>([]);
  readonly items = this._items.asReadonly();
  readonly totalCount = computed(() => this._items().reduce((acc, i) => acc + i.qty, 0));

  addItem(item: CartItem) {
    this._items.update(list => [...list, item]);
  }
}

// In Sibling A (Header): reads totalCount()
// In Sibling B (ProductCard): calls cartService.addItem(product)
// Both views update with zero boilerplate and O(1) reactive precision.
```

---

## 8. Modern Coding Standards: Are NgModules Required in Angular 22?

### The Verdict: **Definitively NO.**

In Angular 22:
- Standalone components, directives, and pipes are **standard and default**.
- Applications bootstrap via `bootstrapApplication(AppComponent, appConfig)` rather than `AppModule`.
- Routing, HTTP, and animations are registered through functional providers (`provideRouter`, `provideHttpClient`, `provideAnimationsAsync`).

```typescript
// Modern Angular 22 Bootstrapping (Zero NgModules)
// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
```

### When might you still encounter NgModules?
1. **Legacy Brownfield Codebases:** Migrating legacy enterprise codebases gradually using `importProvidersFrom(LegacyModule)`.
2. **Third-Party Libraries:** Older packages that haven't yet exported functional standalone providers.

---

## 9. View Encapsulation & CSS Scoping: Emulated vs ShadowDom vs None

How does Angular scope styles, and what are the exact rules for CSS leakage between components?

```
      [Parent Component (encapsulation: Emulated)]
      CSS: p { color: blue; }  ==>  p[_ngcontent-c1] { color: blue; }
             │
             ├── <p _ngcontent-c1>Parent text</p>  (BLUE)
             │
             └── <app-child _nghost-c2>
                   <p _ngcontent-c2>Child text</p> (BLACK — NOT Blue!)
```

### 9.1 The Three ViewEncapsulation Modes

| Mode | Scoping Mechanism | CSS Leakage Rule | Use Case |
| :--- | :--- | :--- | :--- |
| **`ViewEncapsulation.Emulated`** (Default) | Injects unique host (`_nghost-c*`) and content (`_ngcontent-c*`) attributes. Rewrites CSS selectors. | Styles **never** leak from parent to child or child to parent. | 99% of enterprise Angular applications. |
| **`ViewEncapsulation.ShadowDom`** | Attaches a native browser Shadow Root (`element.attachShadow({ mode: 'open' })`). | Strict hardware-level DOM & CSS boundary. Global styles cannot penetrate. | Standalone Web Components, Micro-Frontends. |
| **`ViewEncapsulation.None`** | Injects raw CSS into document `<head>`. | Styles apply **globally** across the entire DOM tree! | Global CSS resets, theme overrides (high collision risk). |

### 9.2 The Golden CSS Scoping Rules
1. **If I write CSS in a Parent component, does it affect the Child component?**
   - **NO.** Parent styles target elements matching `[_ngcontent-parent]`. Child elements are stamped with `[_ngcontent-child]`.
   - *Exception:* Inheritable CSS properties (such as `font-family`, `color`, `line-height`) inherit down the DOM tree naturally via standard browser cascading rules, unless explicitly overridden by the child.
2. **If I write CSS in a Child component, does it affect the Parent component?**
   - **NO.** Child styles target `[_ngcontent-child]`, which does not exist on parent DOM nodes.
3. **How do I style the Component's Own Host Element?**
   - Use the `:host` selector:
     ```css
     :host {
       display: block;
       padding: 16px;
       border-radius: 8px;
     }
     :host(.dark-theme) {
       background: #0f172a;
     }
     ```
4. **Why is `::ng-deep` Deprecated and What Should You Use Instead?**
   - `::ng-deep` disables style scoping for subsequent selectors, allowing parent rules to bleed into child components.
   - **Why it's bad:** It breaks encapsulation, causes unintended side effects, and couples parent stylesheets to child internals.
   - **Modern Production Solution:** Use **CSS Custom Properties (Variables)**:
     ```css
     /* In Parent component */
     :host {
       --card-theme-color: #38bdf8;
     }

     /* In Child component */
     .card-header {
       color: var(--card-theme-color, #ffffff);
     }
     ```

---

## 10. Step-by-Step Browser Rendering & Painting Pipeline

When an Angular state change occurs, what happens between the TypeScript line of code and the photons emitting from the screen?

```
┌────────────────────────────────────────────────────────────────────────┐
│                        1. JAVASCRIPT / TYPESCRIPT                       │
│  User Click / Signal Update / WebSocket ➔ Scheduler Microtask Queue   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     2. ANGULAR CHANGE DETECTION                        │
│  Reactive Graph Traverse ➔ Evaluate Bindings ➔ Ivy Instructions Patch   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      3. BROWSER DOM MUTATION                            │
│  Renderer2 writes new attributes, text nodes, and class mutations      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 4. RECALCULATE STYLE (CSSOM MATCH)                     │
│  Matches scoped [_ngcontent-c*] selectors against mutated DOM elements │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      5. RENDER TREE CONSTRUCTION                        │
│  Combines visible DOM nodes + computed CSSOM (skips display: none)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        6. LAYOUT / REFLOW                              │
│  Computes geometry: exact X, Y coordinates, width, height for nodes    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      7. PAINT / RASTERIZATION                          │
│  Converts vector boxes, borders, text, shadows into pixel bitmaps      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      8. GPU COMPOSITE & DISPLAY                        │
│  GPU combines layers (transforms, opacity) onto screen buffer (60Hz)   │
└────────────────────────────────────────────────────────────────────────┘
```

### 10.1 Avoiding Layout Thrashing (Forced Synchronous Reflow)
A common performance disaster in Angular components occurs when code interleaves DOM writes with DOM reads:
```typescript
// ❌ ANTI-PATTERN: Layout Thrashing
items.forEach(el => {
  renderer.setStyle(el, 'width', '100px'); // 1. WRITE (invalidates layout)
  const h = el.offsetHeight;               // 2. FORCED READ (forces instant reflow!)
  renderer.setStyle(el, 'height', `${h * 2}px`); // 3. WRITE
});

// ✅ BEST PRACTICE: Batch Reads, then Batch Writes
const heights = items.map(el => el.offsetHeight); // Batch Reads
items.forEach((el, i) => {
  renderer.setStyle(el, 'width', '100px');        // Batch Writes
  renderer.setStyle(el, 'height', `${heights[i] * 2}px`);
});
```

---

## 11. Senior & Principal Interview Questions & Answers

### Q1: What is the primary difference between `ChangeDetectionStrategy.Default` and `OnPush`?
**Answer:** `Default` checks every single component in the entire component tree on every asynchronous event intercepted by `zone.js`, comparing previous and current template values. `OnPush` tells Angular to skip checking the component subtree unless an `@Input`/`input()` reference changes, a template DOM event fires, an `async` pipe emits, a Signal read in the template changes, or `ChangeDetectorRef.markForCheck()` is called manually.

### Q2: How does `provideZonelessChangeDetection()` work under the hood in Angular 22?
**Answer:** It eliminates `zone.js` and its monkey-patching overhead (-15kB bundle savings). Instead of relying on global async interception, Angular uses a microtask scheduler. Components notify the scheduler when their reactive signals change, template events fire, or `markForCheck()` is called. The scheduler then triggers a targeted O(1) view refresh cycle directly on the dirty components.

### Q3: Why does modifying an object property in-place fail to update an `OnPush` component?
**Answer:** `OnPush` checks input parameters using shallow reference equality (`Object.is(prev, curr)` or `===`). If you mutate a property inside an existing object (e.g., `user.name = 'New'`), the memory reference of `user` remains identical. Angular evaluates `prevUser === currUser` as `true` and skips running change detection on that component.

### Q4: What happens if a WebSocket pushes 100 messages per second in an Angular app with Default strategy?
**Answer:** In `Default` strategy with `zone.js`, every incoming WebSocket message triggers an `ApplicationRef.tick()`, causing 100 full-tree component checks per second. This saturates the main JavaScript thread, causes severe frame drops (well below 60fps), and spikes CPU usage. The production solution is to throttle the stream using RxJS operators (`throttleTime(60)`) and convert it to a Signal using `toSignal()`, or execute the WebSocket listener inside `NgZone.runOutsideAngular()`.

### Q5: How does the `async` pipe prevent memory leaks and update `OnPush` components?
**Answer:** The `async` pipe subscribes to the Observable and calls `markForCheck()` whenever a new value emits, ensuring `OnPush` components are included in the next render cycle. Furthermore, when the component's `ngOnDestroy` lifecycle hook fires, the `async` pipe automatically calls `.unsubscribe()`, guaranteeing that no orphaned subscriptions or memory leaks persist.

### Q6: What is the modern Angular 22 replacement for `takeUntil(this.destroy$)`?
**Answer:** Modern Angular provides `takeUntilDestroyed()`, which ties unsubscription directly to the component or service's `DestroyRef`. It can be called directly inside an injection context (constructor or field initializer) without needing to manually create or trigger a `Subject`. Even better, converting Observables to Signals using `toSignal()` automatically cleans up subscriptions upon destruction.

### Q7: Are `NgModule`s still required or recommended in Angular 22?
**Answer:** No. Standalone components, directives, and pipes are the official standard and default in Angular 22. Applications bootstrap via `bootstrapApplication(AppComponent, appConfig)`, and dependencies are provided functionally (`provideRouter`, `provideHttpClient`). `NgModule`s are only maintained for backward compatibility with legacy applications and older third-party libraries.

### Q8: If a Parent component defines `p { color: red; }`, why don't child `<p>` tags turn red under `ViewEncapsulation.Emulated`?
**Answer:** Under `ViewEncapsulation.Emulated`, Angular appends a unique content attribute to elements (e.g. `p[_ngcontent-ng-c1]`). The child component's `<p>` tags are assigned a different attribute (e.g. `_ngcontent-ng-c2`). Because the selector `p[_ngcontent-ng-c1]` does not match elements with `_ngcontent-ng-c2`, the parent's styles cannot select child elements.

### Q9: What is the difference between `ChangeDetectorRef.markForCheck()` and `detectChanges()`?
**Answer:** `markForCheck()` does not run change detection immediately; it marks the current component and all its ancestors up to the root as dirty, scheduling them for the next change detection cycle. `detectChanges()` immediately and synchronously executes change detection on the current component and its children, re-evaluating bindings and updating the DOM instantly.

### Q10: Why is `::ng-deep` deprecated, and how should parent-child theme customization be implemented?
**Answer:** `::ng-deep` strips encapsulation scoping attributes, allowing styles to pierce child components. It creates brittle, tightly coupled code that easily breaks when child component templates change. Modern enterprise architecture replaces `::ng-deep` with CSS Custom Properties (CSS variables) defined on the parent host and consumed within the child component.

### Q11: How do Angular Signals solve the "Diamond Problem"?
**Answer:** Angular Signals use a two-phase push-pull reactive graph. During the push phase, notifications mark consumers as dirty without executing computations. During the pull phase, downstream consumers evaluate dependencies topologically. Even if two branches depend on the same root signal, the final computation evaluates only once with synchronized values, preventing stale intermediate states.

### Q12: What is Layout Thrashing (Forced Synchronous Reflow) and how do you prevent it in Angular?
**Answer:** Layout Thrashing occurs when JavaScript reads a geometry property (like `offsetWidth`, `clientHeight`, `getBoundingClientRect()`) immediately after modifying DOM styles in a loop. The browser is forced to pause JavaScript execution and perform an immediate, expensive layout recalculation. It is prevented by batching all DOM reads first, and then applying all DOM writes in a separate step.

### Q13: When would an architect choose `ViewEncapsulation.ShadowDom` over `Emulated`?
**Answer:** When building reusable Web Components, micro-frontends, or design system widgets meant to be distributed across multiple independent applications. Shadow DOM creates a native browser encapsulation barrier that prevents host application global styles from inadvertently altering the component's internal design.

### Q14: In modern Angular 22, how should two sibling components with no parent-child relationship communicate?
**Answer:** By injecting a shared singleton service (`@Injectable({ providedIn: 'root' })`) that exposes private writable signals updated via public methods, paired with public read-only signals (`asReadonly()`) or `computed()` properties consumed by both siblings. This provides reactive, type-safe, and zero-boilerplate synchronization without manual subscriptions.

---

## 12. Summary Checklist for Senior & Principal Architects

- [x] **Zoneless Readiness:** Design components to be reactive via Signals; eliminate reliance on `zone.js` monkey-patching.
- [x] **Default to OnPush:** Every component in production should use `changeDetection: ChangeDetectionStrategy.OnPush`.
- [x] **Immutable State Updates:** Never mutate object properties in-place; always produce new references or use `signal.update()`.
- [x] **High-Frequency Throttling:** Buffer continuous streams (WebSockets, SSE) using RxJS `throttleTime` or `sampleTime` before passing to `toSignal()`.
- [x] **Zero Memory Leaks:** Replace manual subscriptions with `toSignal()` or `takeUntilDestroyed(destroyRef)`.
- [x] **CSS Isolation:** Never use `::ng-deep`; use CSS Custom Properties for cross-component styling and thematic injection.
- [x] **Render Pipeline Discipline:** Avoid layout thrashing; keep DOM writes batched and animate using GPU-accelerated `transform` and `opacity`.
