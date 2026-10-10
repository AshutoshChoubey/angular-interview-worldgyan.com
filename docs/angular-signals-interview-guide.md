# Angular Signals — Comprehensive Interview Preparation Guide

> **Author**: worldgyan.com / Ashutosh Choubey  
> **Topic**: Angular Signals (Angular 16, 17, 18, 19+)  
> **Target Audience**: Frontend Engineers, Senior Angular Developers, Technical Leads  

---

## Table of Contents
1. [Core Fundamentals](#1-core-fundamentals)
2. [Writable Signals (`signal`)](#2-writable-signals)
3. [Computed Signals (`computed`)](#3-computed-signals)
4. [Effects (`effect`) & Side Effects](#4-effects-and-side-effects)
5. [Advanced Signal Features & Utilities](#5-advanced-signal-features-and-utilities)
6. [Signal-Based Component APIs (`input`, `output`, `model`, `viewChild`)](#6-signal-based-component-apis)
7. [Signals vs RxJS Observables](#7-signals-vs-rxjs-observables)
8. [Zoneless Angular & Change Detection](#8-zoneless-angular-and-change-detection)
9. [Common Pitfalls & Anti-Patterns](#9-common-pitfalls-and-anti-patterns)
10. [High-Frequency Interview Questions (Q&A)](#10-high-frequency-interview-questions)

---

## 1. Core Fundamentals

### What is a Signal in Angular?
A **Signal** is a reactive wrapper around a value that notifies interested consumers when that value changes. 
Signals implement a **push-pull reactivity algorithm**:
- **Push**: When a signal value changes, it pushes a notification to its consumers that the value is dirty.
- **Pull**: The actual computation or DOM update only pulls (reads) the new value when it is needed.

```typescript
import { signal } from '@angular/core';

const count = signal(0);
console.log(count()); // Read the value by calling it like a getter function: 0
```

### Why did Angular introduce Signals?
1. **Fine-Grained Reactivity**: Traditional Angular checks the entire component tree (top-to-bottom) during change detection unless optimized with `OnPush`. Signals inform Angular *exactly* which template binding needs updating.
2. **Path to Zoneless Angular**: Angular historically relied on `zone.js` to monkey-patch asynchronous browser APIs (setTimeout, Promise, XHR, events) to schedule change detection. Signals allow Angular to know state changed without needing `zone.js`.
3. **Glitch-Free State**: Avoids transient inconsistent states (e.g., the diamond dependency problem).
4. **Simpler Mental Model**: Eliminates the need for manual `.unsubscribe()` calls and `async` pipes for basic synchronous component state.

---

## 2. Writable Signals

A writable signal allows direct updates to its value.

```typescript
import { signal } from '@angular/core';

// Creation
const counter = signal<number>(10);

// 1. Direct replacement via .set()
counter.set(20);

// 2. Value transformation via .update()
counter.update(current => current + 1); // 21
```

> **Note on `.mutate()`**: In early Angular 16 previews, `signal.mutate()` existed. It was **removed in Angular 17** because mutating objects in-place broke equality checks and predictable data flow. Always return new immutable references with `.update()`.

### Immutability Best Practice
```typescript
interface UserProfile {
  name: string;
  role: string;
}

const user = signal<UserProfile>({ name: 'Ashutosh', role: 'Developer' });

// Recommended: Return a new object reference
user.update(u => ({ ...u, role: 'Lead Architect' }));
```

---

## 3. Computed Signals

A **computed signal** derives its value from other signals. It is declared using the `computed()` function.

```typescript
import { signal, computed } from '@angular/core';

const price = signal(100);
const taxRate = signal(0.18);

const total = computed(() => price() * (1 + taxRate()));
console.log(total()); // 118
```

### Key Properties of `computed()`:
1. **Lazily Evaluated**: The calculation only runs when `total()` is read.
2. **Memoized**: The result is cached. Subsequent reads do not re-run the expression unless one of its dependent signals has changed.
3. **Dynamic Dependency Tracking**: Dependencies are not static. If a signal is inside an `if` branch that is skipped, it is **not** registered as a dependency.
4. **Read-Only**: Computed signals do not have `.set()` or `.update()`.

### Dynamic Dependency Example
```typescript
const showDetails = signal(false);
const secretInfo = signal('Classified');

const display = computed(() => {
  if (showDetails()) {
    return `Secret: ${secretInfo()}`;
  }
  return 'Hidden';
});

// While showDetails() is false, secretInfo() is NOT tracked.
// Changes to secretInfo() will NOT mark display() dirty!
```

---

## 4. Effects and Side Effects

An `effect()` runs a side-effect whenever one or more tracked signals change.

```typescript
import { Component, signal, effect } from '@angular/core';

@Component({
  selector: 'app-counter',
  standalone: true,
  template: `<button (click)="increment()">Click {{ count() }}</button>`
})
export class CounterComponent {
  count = signal(0);

  constructor() {
    // Automatically runs when count() changes
    effect(() => {
      console.log(`Current count is: ${this.count()}`);
      localStorage.setItem('savedCount', this.count().toString());
    });
  }

  increment() {
    this.count.update(c => c + 1);
  }
}
```

### When to Use `effect()`:
- Logging / Analytics
- Syncing state with external non-Angular APIs (e.g., `localStorage`, WebSockets, `<canvas>`, charting libraries)
- Custom DOM measurements or manipulation

### When NOT to Use `effect()`:
- **Never propagate state to other signals using effects!** Use `computed()` instead.
- Writing to signals inside an `effect()` is disabled by default to prevent infinite cycles. If necessary, it requires `{ allowSignalWrites: true }`, but it is considered a code smell in 99% of cases.

### Cleanup with `onCleanup`
```typescript
effect((onCleanup) => {
  const timer = setInterval(() => {
    console.log(`Tick for ${this.userId()}`);
  }, 1000);

  // Invoked before next effect run and on component destruction
  onCleanup(() => {
    clearInterval(timer);
  });
});
```

---

## 5. Advanced Signal Features and Utilities

### `untracked()`
Reads a signal's current value inside `computed` or `effect` **without** registering it as a reactive dependency:

```typescript
import { signal, computed, untracked } from '@angular/core';

const currentUser = signal('Ashutosh');
const loggingEnabled = signal(true);

const message = computed(() => {
  const user = currentUser();
  // We want to read loggingEnabled, but do NOT want to re-run when loggingEnabled toggles
  const isLogging = untracked(() => loggingEnabled());
  return `User: ${user} (Logged: ${isLogging})`;
});
```

### Custom Equality Functions
By default, signals use strict reference equality (`===`). You can customize this:

```typescript
import { signal } from '@angular/core';

interface Coordinate {
  x: number;
  y: number;
}

const point = signal<Coordinate>(
  { x: 10, y: 20 },
  {
    equal: (a, b) => a.x === b.x && a.y === b.y
  }
);

// Setting a new object with identical x,y will NOT trigger consumers!
point.set({ x: 10, y: 20 });
```

---

## 6. Signal-Based Component APIs

Angular 17+ and 18+ introduced modern signal-based inputs, outputs, queries, and two-way models:

### 1. `input()` & `input.required()`
Replaces `@Input()` decorators:
```typescript
import { Component, input } from '@angular/core';

@Component({ ... })
export class UserCardComponent {
  // Optional with default
  theme = input<'light' | 'dark'>('light');

  // Required
  userId = input.required<string>();

  // Transform input
  age = input(0, { transform: (val: string | number) => Number(val) });
}
```

### 2. `output()`
Replaces `@Output() emitter = new EventEmitter()`:
```typescript
import { output } from '@angular/core';

export class ChildComponent {
  itemSelected = output<string>();

  onSelect(id: string) {
    this.itemSelected.emit(id);
  }
}
```

### 3. `model()` (Two-Way Binding)
Creates a writable signal that supports `[(value)]` banana-in-a-box syntax from parents:
```typescript
import { Component, model } from '@angular/core';

@Component({ ... })
export class ToggleComponent {
  checked = model<boolean>(false);

  toggle() {
    this.checked.update(val => !val);
  }
}
// Parent usage: <app-toggle [(checked)]="isDarkTheme" />
```

### 4. `viewChild()` and `viewChildren()`
Replaces `@ViewChild` and `@ViewChildren`:
```typescript
import { Component, viewChild, ElementRef } from '@angular/core';

@Component({ ... })
export class SearchComponent {
  searchInput = viewChild.required<ElementRef<HTMLInputElement>>('inputRef');

  focusInput() {
    this.searchInput().nativeElement.focus();
  }
}
```

---

## 7. Signals vs RxJS Observables

| Feature | Angular Signals | RxJS Observables |
| :--- | :--- | :--- |
| **Primary Use Case** | Synchronous state management & UI bindings | Asynchronous streams, events, concurrency |
| **Values Over Time** | Always holds a current value (`T`) | Stream of multiple items over time (`0..N`) |
| **Evaluation** | Glitch-free, synchronous pull/push | Push-based, asynchronous or synchronous |
| **Memory Management** | Automatic cleanup with template / injection context | Requires explicit unsubscribe (`takeUntilDestroyed`, `async` pipe) |
| **Operators** | Simple derivation via `computed()` | Rich operator suite (`debounceTime`, `switchMap`, `catchError`) |
| **Error Handling** | Normal JavaScript try/catch | Built-in stream error channels (`catchError`) |

### Interop (`@angular/core/rxjs-interop`)

#### Observable to Signal: `toSignal()`
```typescript
import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({ ... })
export class PostListComponent {
  private http = inject(HttpClient);

  // Converts Observable to Signal. Handles unsubscription automatically!
  posts = toSignal(this.http.get<Post[]>('/api/posts'), { initialValue: [] });
}
```

#### Signal to Observable: `toObservable()`
```typescript
import { Component, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, switchMap } from 'rxjs';

@Component({ ... })
export class AutoCompleteComponent {
  searchQuery = signal('');

  // Converts signal to Observable to leverage RxJS operators like debounce
  searchResults$ = toObservable(this.searchQuery).pipe(
    debounceTime(300),
    switchMap(query => this.searchApi(query))
  );

  searchApi(q: string) { /* ... */ }
}
```

---

## 8. Zoneless Angular & Change Detection

### The Problem with `zone.js`:
- Monkey-patches every global async API (`addEventListener`, `fetch`, `Promise`, timers).
- Triggers change detection on the entire component tree from top to bottom whenever *any* async task finishes, even if no component state changed.
- Adds ~30KB bundle overhead and hinders fine-grained debugging.

### How Signals Enable Zoneless:
With Signals, Angular knows *precisely* which node depends on which signal. When a signal updates, Angular schedules targeted template updates without checking the whole application tree.
In Angular 18+, you can enable Zoneless:
```typescript
// app.config.ts
import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection()
  ]
};
```

---

## 9. Common Pitfalls & Anti-Patterns

1. **Mutating state in place without creating new references**:
   ```typescript
   // WRONG:
   items().push(newItem); // Consumer signals won't trigger!

   // CORRECT:
   items.update(list => [...list, newItem]);
   ```
2. **Writing to signals in an effect**:
   ```typescript
   // WRONG:
   effect(() => {
     if (this.counter() > 10) {
       this.isTooHigh.set(true); // Don't do this!
     }
   });

   // CORRECT:
   isTooHigh = computed(() => this.counter() > 10);
   ```
3. **Forgetting to invoke the signal getter in templates or code**:
   ```typescript
   // In template:
   {{ count }}   <!-- WRONG: renders [Function: Signal] or fails -->
   {{ count() }} <!-- CORRECT -->
   ```
4. **Calling `effect()` outside an Injection Context**:
   `effect()` requires an injection context (like constructor or field initializer). If called inside a regular method, you must pass an explicit `Injector`:
   ```typescript
   private injector = inject(Injector);

   someMethod() {
     effect(() => { ... }, { injector: this.injector });
   }
   ```

---

## 10. High-Frequency Interview Questions

### Q1: What is the "Diamond Dependency Problem" and how do Signals solve it?
**Answer**:
Suppose Signal `A` derives `B` and `C`, and `D` is computed from both `B` and `C`.
In naive reactive systems, updating `A` would update `B` (triggering `D`), then update `C` (triggering `D` a second time with intermediate state). This causes temporary inconsistency (a "glitch").
Angular Signals use a **two-phase push-pull graph**:
1. **Mark Phase (Push)**: When `A` changes, dirty flags are propagated through `B`, `C`, down to `D`.
2. **Recompute Phase (Pull)**: When `D` is read, it resolves dependencies in topological order, computing `B` and `C` first, and then evaluating `D` exactly once.

### Q2: Why is `computed()` preferred over `effect()` for derived state?
**Answer**:
`computed()` is lazy, memoized, purely functional, and glitch-free. `effect()` is eager, asynchronous (scheduled as a microtask), and side-effect oriented. Deriving state via effects causes unnecessary re-renders, race conditions, and potential infinite cycles.

### Q3: When should you still use RxJS instead of Signals?
**Answer**:
Use RxJS for:
- Event streams (mouse drags, WebSocket messages)
- Complex asynchronous orchestration (`switchMap`, `mergeMap`, `concatMap`)
- Debouncing, throttling, or buffering time-based operations
- Retry policies and stream-level error handling.
Use Signals for synchronous UI state, component inputs/outputs, and template rendering.

### Q4: How does `toSignal` handle RxJS subscription lifecycles?
**Answer**:
`toSignal` automatically subscribes using the current `DestroyRef` (injection context) and un-subscribes when the enclosing component or service is destroyed. It avoids memory leaks without needing manual unsubscribe calls.

### Q5: Can we use Signals with `ChangeDetectionStrategy.OnPush`?
**Answer**:
Yes! Signals integrate seamlessly with `OnPush`. In fact, reading a signal in a template automatically marks the component dirty for change detection when that signal changes, making `OnPush` components naturally reactive.
