# Angular Interview & Study Guide — worldgyan.com

Welcome to the **Angular Interview & Deep Dive Study Guide**, curated for frontend developers preparing for Senior and Lead Angular developer interviews.

This repository is organized into **modular topic folders**. Each topic has its own dedicated directory containing in-depth concept breakdowns, interview Q&A, and practical TypeScript/Angular code examples.

---

## 🗂️ Topics & Modules

### 1. 📡 [Angular Signals (`signals/`)](signals/README.md)
The modern reactivity model in Angular 16, 17, 18, and 19+.

- 📖 **Study Guide**: [`signals/README.md`](signals/README.md) (or [`signals/angular-signals-interview-guide.md`](signals/angular-signals-interview-guide.md))
- 💻 **Practical Examples**:
  - [`signals/examples/signals-basics.ts`](signals/examples/signals-basics.ts) — Writable signals (`signal()`, `.set()`, `.update()`) & immutability.
  - [`signals/examples/computed-and-dynamic-deps.ts`](signals/examples/computed-and-dynamic-deps.ts) — `computed()`, dynamic dependency tracking, memoization, `untracked()`, custom equality.
  - [`signals/examples/effects-and-cleanup.ts`](signals/examples/effects-and-cleanup.ts) — `effect()`, injection contexts, `onCleanup()`, and external API sync.
  - [`signals/examples/signal-component-apis.ts`](signals/examples/signal-component-apis.ts) — `input()`, `output()`, `model()`, and `viewChild()`.
  - [`signals/examples/rxjs-signal-interop.ts`](signals/examples/rxjs-signal-interop.ts) — `toSignal()` & `toObservable()` interop patterns.

---

## ⚡ Quick Signals Cheat Sheet

```typescript
import { signal, computed, effect } from '@angular/core';

// Writable Signal
const count = signal(0);
count.set(5);                   // Replaces value
count.update(n => n + 1);       // Updates based on previous value
console.log(count());           // Reads value (getter function)

// Computed Signal (Lazy & Memoized)
const double = computed(() => count() * 2);

// Side Effect (Runs in Injection Context)
effect(() => {
  console.log(`Count changed to: ${count()}`);
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

## 🚀 Repository Topic Roadmap
- [x] 📡 **Signals** (`signals/`)
- [ ] ⚡ **Zoneless Angular** (`zoneless/`)
- [ ] 🔀 **Modern Control Flow** (`control-flow/` - `@if`, `@for`, `@defer`)
- [ ] 💉 **Dependency Injection** (`dependency-injection/` - `inject()`, hierarchical injectors)
- [ ] 🌐 **SSR & Hydration** (`ssr-hydration/` - Event replay, incremental hydration)
- [ ] 🏎️ **Performance & Change Detection** (`performance/` - `OnPush`, detaching change detector)
