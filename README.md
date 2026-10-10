# Angular Interview & Study Guide — worldgyan.com

Welcome to the **Angular Signals & Modern Reactivity Interview Guide**, curated for developers preparing for Senior and Lead Angular developer interviews.

---

## 📚 Contents

### 1. 📖 Comprehensive Study Guides
- [**Angular Signals Interview Guide**](docs/angular-signals-interview-guide.md): In-depth guide covering fundamentals, push-pull reactivity, diamond problem, `computed`, `effect`, `untracked`, custom equality, Zoneless change detection, and top interview questions & answers.

---

### 2. 💻 Practical Code Examples

| File | Description | Key APIs |
| :--- | :--- | :--- |
| [`examples/signals-basics.ts`](examples/signals-basics.ts) | Writable signals, immutable updates | `signal()`, `set()`, `update()` |
| [`examples/computed-and-dynamic-deps.ts`](examples/computed-and-dynamic-deps.ts) | Computed values, dynamic dependency tracking, memoization | `computed()`, `untracked()`, `equal` |
| [`examples/effects-and-cleanup.ts`](examples/effects-and-cleanup.ts) | Side effects, injection contexts, teardown | `effect()`, `onCleanup()`, `runInInjectionContext` |
| [`examples/signal-component-apis.ts`](examples/signal-component-apis.ts) | Signal component primitives | `input()`, `output()`, `model()`, `viewChild()` |
| [`examples/rxjs-signal-interop.ts`](examples/rxjs-signal-interop.ts) | RxJS & Signals interoperability | `toSignal()`, `toObservable()` |

---

## ⚡ Quick Signals Cheat Sheet

```typescript
import { signal, computed, effect } from '@angular/core';

// Writable Signal
const count = signal(0);
count.set(5);                   // Replaces value
count.update(n => n + 1);       // Updates based on previous value
console.log(count());           // Reads value (getter)

// Computed Signal (Lazy & Memoized)
const double = computed(() => count() * 2);

// Side Effect (Runs in Injection Context)
effect(() => {
  console.log(`Count is now: ${count()}`);
});
```

---

## 🎯 Key Differences: Signals vs Observables

| Property | Signals | Observables (RxJS) |
| :--- | :--- | :--- |
| **Type** | Synchronous state holder | Asynchronous event stream |
| **Always has value?** | Yes (`T`) | No (values arrive over time) |
| **Subscription cleanup**| Automatic (garbage collected) | Manual (`unsubscribe` / `async` pipe / `takeUntilDestroyed`) |
| **Reactivity** | Push-pull (glitch-free) | Push-only |
| **Best used for** | UI state & component inputs | Asynchronous flows, events, debounce, retry |

---

## 🚀 Future Roadmap & Topics
- [x] Angular Signals Deep Dive
- [ ] Angular Zoneless Architecture (`provideExperimentalZonelessChangeDetection`)
- [ ] Control Flow Syntax (`@if`, `@for`, `@switch`, `@defer`)
- [ ] Dependency Injection (`inject()`, hierarchical injectors)
- [ ] Angular SSR & Hydration (Event replay, incremental hydration)
- [ ] Angular Performance Optimization & Change Detection (`OnPush`)
