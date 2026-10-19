# Angular 22 Services & Dependency Injection Architecture

Welcome to the **Angular 22 Services & Dependency Injection Masterclass**, tailored for frontend engineers preparing for Senior, Lead, and Principal Angular engineering interviews.

> **Core Philosophy:** Dependency Injection (DI) is the architectural spine of Angular. In Angular 22, the framework has completed its paradigm shift from legacy constructor-based parameter reflection to the lightweight, composable, functional **`inject()` API**. Angular resolves dependencies through **two distinct parallel trees**: the **ElementInjector Tree** (tied to DOM component hierarchy and view encapsulation) and the **EnvironmentInjector Tree** (tied to application bootstrapping, platform contexts, and routed chunks). Mastering how these trees interact enables zero-boilerplate service composition, safe multi-provider tokens, and bulletproof memory lifecycle management.

---

## 📑 Table of Contents
1. [⚡ 60-Second Executive Cheat Sheet](#1--60-second-executive-cheat-sheet)
2. [💉 Modern `inject()` API vs Constructor Injection](#2--modern-inject-api-vs-constructor-injection)
3. [🌲 The Two Parallel Injector Trees (ElementInjector vs EnvironmentInjector)](#3--the-two-parallel-injector-trees)
4. [📦 8 Types of Services & Provider Scopes](#4--8-types-of-services--provider-scopes)
5. [🛡️ `providers` vs `viewProviders`: Content Projection Isolation](#5--providers-vs-viewproviders-content-projection-isolation)
6. [🔍 Resolution Modifiers (`optional`, `self`, `skipSelf`, `host`)](#6--resolution-modifiers)
7. [🛠️ Provider Recipes: `useClass`, `useExisting`, `useValue`, `useFactory`, `multi`](#7--provider-recipes)
8. [⏱️ Lifecycle, Teardown & Preventing Memory Leaks with `DestroyRef`](#8--lifecycle-teardown--destroyref)
9. [🎯 16 Senior & Principal Interview Q&As](#9--16-senior--principal-interview-qas)
10. [💻 Practical TypeScript Examples](#10--practical-typescript-examples)

---

## 1. ⚡ 60-Second Executive Cheat Sheet

| Architectural Concern | Legacy Angular (< v14) | Modern Angular 22 (v16–v22+) | Under the Hood & Performance Impact |
| :--- | :--- | :--- | :--- |
| **Injection Syntax** | `constructor(private s: Svc)` | `private s = inject(Svc);` | Eliminates `emitDecoratorMetadata` runtime reflection. Enables seamless composition inside functions without class inheritance overhead. |
| **Injection Context** | Constructor parameters only | Field initializers, constructor, or `runInInjectionContext()` | Requires active context where `getInjectable()` is bound. Fails with `NG0203` if invoked asynchronously outside context. |
| **Injector Hierarchy** | ModuleInjector + ElementInjector | **EnvironmentInjector** + **ElementInjector** | Decoupled from legacy `NgModule`. Tied directly to `bootstrapApplication`, standalone route chunks, and environment initializers. |
| **Root Singleton Scope** | `providedIn: 'root'` | `providedIn: 'root'` | Application-wide singleton. Fully tree-shakable: bundlers drop unreferenced services completely from production artifacts. |
| **Platform Scope** | `providedIn: 'platform'` | `providedIn: 'platform'` | Shared across **multiple Angular applications** running in the same browser window (ideal for microfrontend host/remote coordination). |
| **Component Scope** | `providers: [Svc]` | `providers: [Svc]` | New instance created per component in DOM. Visible to component template AND projected content (`<ng-content>`). |
| **View Isolation Scope** | `viewProviders: [Svc]` | `viewProviders: [Svc]` | Restricts service instance strictly to component's own template; **hides** token from projected content (`<ng-content>`). |
| **Resolution Modifiers** | `@Optional() @Self() @SkipSelf() @Host()` | `inject(Svc, { optional: true, self: true, skipSelf: true, host: true })` | Type-safe configuration object passed directly into `inject()`, eliminating parameter decorators and metadata reflection. |
| **Lifecycle Teardown** | `ngOnDestroy()` in class | `inject(DestroyRef).onDestroy(...)` | Allows standalone functions, factory providers, and services to register cleanup callbacks without implementing component lifecycle interfaces. |
| **State Reactivity** | `BehaviorSubject<T>` | `signal<T>()` + `computed()` | Fine-grained $O(1)$ reactivity with zero Zone.js overhead; integrates natively with `provideZonelessChangeDetection()`. |

---

## 2. 💉 Modern `inject()` API vs Constructor Injection

Historically, Angular relied on TypeScript's `emitDecoratorMetadata` to inspect constructor parameter types at runtime. Modern Angular applications standardize on the standalone `inject()` function:

```typescript
// ❌ Legacy Constructor Injection (Verbose, tightly coupled to class constructors)
@Component({ ... })
export class UserProfileComponent {
  constructor(
    private userService: UserService,
    @Optional() private analytics: AnalyticsService,
    @Inject(APP_CONFIG) private config: AppConfig
  ) {}
}

// ✅ Modern Angular 22 Functional Injection (Clean, composable, type-safe)
@Component({ ... })
export class UserProfileComponent {
  private userService = inject(UserService);
  private analytics = inject(AnalyticsService, { optional: true });
  private config = inject(APP_CONFIG);
}
```

### The Injection Context & `runInInjectionContext`:
The `inject()` function relies on an active **Injection Context**. Calling `inject()` inside an asynchronous callback (`setTimeout`, `Promise`, RxJS subscription) or lifecycle hook (`ngOnInit`) throws `NG0203`.
To safely bridge asynchronous boundaries:
```typescript
const injector = inject(Injector);

setTimeout(() => {
  runInInjectionContext(injector, () => {
    const http = inject(HttpClient);
    http.get('/api/data').subscribe();
  });
}, 1000);
```

---

## 3. 🌲 The Two Parallel Injector Trees

Angular does not use a single flat container for dependencies. Instead, it maintains **two distinct injector hierarchies**:

```
[NullInjector] ➔ Top sentinel of all DI. Throws NG0201 unless { optional: true }.
      ▲
[PlatformInjector] ➔ Shared across multiple Angular apps in same DOM (providedIn: 'platform').
      ▲
[RootEnvironmentInjector] ➔ App singletons (providedIn: 'root' / appConfig.providers).
      ▲
[Route EnvironmentInjector] ➔ Lazy route chunk providers: [...]. Destroyed on route unload.
      ▲
====================== [Fall-through Boundary] ======================
      ▲
[Host ElementInjector] ➔ Root Component (<app-root>) providers: [].
      ▲
[Parent ElementInjector] ➔ Parent Component (<user-shell>) providers: [].
      ▲
[Child ElementInjector] ➔ Leaf Component (<user-avatar>) providers / viewProviders.
```

### Resolution Traversal Rule:
1. Angular starts searching at the **ElementInjector** of the requesting component.
2. It ascends up ancestor **ElementInjectors** (following DOM component nesting).
3. If not found in the ElementInjector tree, it **falls through** to the **EnvironmentInjector** where the component was instantiated.

---

## 4. 📦 8 Types of Services & Provider Scopes

1. **Root Singleton Service (`providedIn: 'root'`)**: Application-wide singleton, created lazily, tree-shakable.
2. **Platform Singleton Service (`providedIn: 'platform'`)**: Shared across multiple Angular applications in the same window (microfrontends).
3. **Transient Scoped Service (`providedIn: 'any'`)**: Eager code shares one instance; each lazy-loaded route chunk receives its own independent instance.
4. **Component Scoped Service (`providers: [Service]`)**: Instantiated per component instance in the DOM; visible to template AND projected content.
5. **View-Isolated Service (`viewProviders: [Service]`)**: Instantiated per component, but hidden from projected `<ng-content>`.
6. **Functional Composable Services**: Pure functions using `inject()` under the hood (`useWindowDimensions()`).
7. **InjectionToken & Factory Services**: Self-providing tree-shakable tokens (`new InjectionToken<T>('...', { factory: () => ... })`).
8. **Signal-Based State Stores**: State stores using private `signal()` and public `computed()`.

---

## 5. 🛡️ `providers` vs `viewProviders`: Content Projection Isolation

```typescript
@Component({
  selector: 'app-accordion-item',
  standalone: true,
  viewProviders: [AccordionInternalState],
  template: `
    <header (click)="state.toggle()">{{ title }}</header>
    <div class="content">
      <ng-content></ng-content> <!-- CANNOT see AccordionInternalState! -->
    </div>
  `
})
export class AccordionItemComponent {
  protected state = inject(AccordionInternalState);
}
```
- **Architectural Why:** Prevents projected consumer markup from accidentally hijacking or polluting internal component coordination tokens.

---

## 6. 🔍 Resolution Modifiers

| Modifier Option | Traversal Behavior | Common Architectural Use Case |
| :--- | :--- | :--- |
| `{ optional: true }` | If token is not found up to `NullInjector`, returns `null` instead of throwing `NG0201`. | Optional feature plugins, telemetry loggers, or fallback services. |
| `{ self: true }` | Searches **only** the ElementInjector of the immediate component/directive. Does not ascend to parents. | Enforcing that a directive must be placed on an element that provides its own controller. |
| `{ skipSelf: true }` | Skips current ElementInjector; starts searching immediately at the **parent** ElementInjector. | Hierarchical parent-child linking (nested tree nodes, accordion groups, recursive menu items). |
| `{ host: true }` | Traverses upward through ElementInjectors but **stops** at the host component boundary. | Directives needing access to their host component without penetrating outer parent component scopes. |

---

## 7. 🛠️ Provider Recipes: `useClass`, `useExisting`, `useValue`, `useFactory`, `multi`

- **`useClass`**: Substitutes an alternative class implementation (creates a new instance).
- **`useExisting`**: Aliases an existing token to an already-created instance (guarantees a single shared instance; prevents duplicate memory allocation).
- **`useValue`**: Injects static constants or mock objects.
- **`useFactory`**: Computes dependency dynamically with explicit dependencies.
- **`multi: true`**: Creates pluggable token arrays (e.g., interceptor lists, validator pipelines).

---

## 8. ⏱️ Lifecycle, Teardown & Preventing Memory Leaks with `DestroyRef`

```typescript
@Injectable() // Component-scoped
export class LiveMetricsService {
  constructor() {
    // Automatically cancels interval subscription when host component unmounts
    interval(1000)
      .pipe(takeUntilDestroyed())
      .subscribe(tick => console.log('Tick:', tick));

    inject(DestroyRef).onDestroy(() => {
      console.log('Cleaned up resources!');
    });
  }
}
```

---

## 9. 🎯 16 Senior & Principal Interview Q&As

### Q1: What is the primary difference between constructor injection and the inject() API?
**Answer:** Constructor injection relies on TypeScript compiler reflection metadata (`emitDecoratorMetadata`) and restricts injection to class instantiation. The `inject()` API is a functional primitive that executes during an active **Injection Context**. It eliminates decorator metadata, enables clean TypeScript generic type inference without `@Inject()`, simplifies inheritance by removing `super(serviceA, serviceB, ...)` boilerplate, and allows dependency injection inside standalone composable functions.

### Q2: What causes error NG0203 and how do you resolve it?
**Answer:** `NG0203: inject() must be called from an injection context` occurs when `inject()` is executed outside of class field initializers, constructors, factory functions, or functional guards—most commonly inside an asynchronous callback (`setTimeout`, `Promise`, RxJS stream) or lifecycle hook (`ngOnInit`). To resolve it, either call `inject()` synchronously during field declaration, or inject the `Injector` instance in the constructor and wrap the asynchronous call inside `runInInjectionContext(this.injector, () => { ... })`.

### Q3: Explain the two parallel injector trees in Angular. How does resolution traverse them?
**Answer:** Angular maintains an **ElementInjector Tree** (tied to DOM component hierarchy and view encapsulation) and an **EnvironmentInjector Tree** (tied to application bootstrapping, platform instances, and lazy-loaded routes). When resolving a token, Angular starts at the requesting component's ElementInjector and walks up ancestor element injectors. If the token is not found at `<app-root>`, it **falls through** to the EnvironmentInjector where the component was instantiated.

### Q4: What is the difference between providers and viewProviders in @Component?
**Answer:** `providers` registers tokens in the component's ElementInjector and makes them accessible to both the component's own template **and any projected content** passed via `<ng-content>`. In contrast, `viewProviders` restricts token visibility **strictly to the component's internal view template**. Projected content elements cannot see `viewProviders`. This is essential for design system components (e.g., accordions) where internal tokens must not collide with projected user markup.

### Q5: What is the difference between providedIn: 'root', 'platform', and 'any'?
**Answer:** `providedIn: 'root'` creates a single application-wide singleton inside `RootEnvironmentInjector` (tree-shakable if unreferenced). `providedIn: 'platform'` creates a singleton inside `PlatformInjector`, shared across **multiple Angular applications** on the same webpage (microfrontends). `providedIn: 'any'` creates a singleton for eager code, but creates a **new, independent instance** for every lazy-loaded route chunk that requests it.

### Q6: What is the difference between useClass and useExisting?
**Answer:** `useClass: TargetClass` instructs the injector to instantiate a **brand new instance** of `TargetClass`. `useExisting: TargetToken` instructs the injector to resolve the token to the **already-created instance** of `TargetToken`. Using `useClass` to alias a service creates duplicate instances in memory with desynchronized state; `useExisting` guarantees a single shared instance.

### Q7: How does { skipSelf: true } work and when is it necessary?
**Answer:** `{ skipSelf: true }` instructs the injector to bypass the current component's ElementInjector and begin the search immediately at the parent ElementInjector. It is essential when building recursive or hierarchical tree components (like `<app-tree-node>`) where a component needs a reference to its **parent** component instance of the same type without injecting itself.

### Q8: How does DestroyRef prevent memory leaks in modern Angular services?
**Answer:** `DestroyRef` allows any service, factory, or standalone function executing within an injection context to register teardown callbacks via `inject(DestroyRef).onDestroy(() => { ... })`. This powers modern RxJS interop operators like `takeUntilDestroyed()` and enables automatic cleanup of WebSocket connections, timers, and browser event listeners when component-scoped services unmount.

---

## 10. 💻 Practical TypeScript Examples

Explore the complete runnable, annotated code examples in [`examples/`](examples/):

1. [`examples/01-inject-function-vs-constructor.ts`](examples/01-inject-function-vs-constructor.ts) — Modern `inject()` API, field initializers, type inference, and `runInInjectionContext()`.
2. [`examples/02-injector-hierarchy-resolution.ts`](examples/02-injector-hierarchy-resolution.ts) — ElementInjector vs EnvironmentInjector traversal, NullInjector fallback.
3. [`examples/03-service-scopes-and-providers.ts`](examples/03-service-scopes-and-providers.ts) — `providedIn: 'root'`, `'platform'`, `'any'`, and component-level providers.
4. [`examples/04-providers-vs-viewproviders.ts`](examples/04-providers-vs-viewproviders.ts) — Content projection isolation and UI library widget token shielding.
5. [`examples/05-resolution-modifiers-self-host.ts`](examples/05-resolution-modifiers-self-host.ts) — `optional`, `self`, `skipSelf`, `host`, and recursive tree node linking.
6. [`examples/06-injection-tokens-and-factories.ts`](examples/06-injection-tokens-and-factories.ts) — Tree-shakable `InjectionToken` with factories, `useExisting`, and `multi: true`.
7. [`examples/07-signal-store-service-pattern.ts`](examples/07-signal-store-service-pattern.ts) — Reactive signal store service, $O(1)$ reactivity, Zoneless ready.
8. [`examples/08-functional-services-and-destroyref.ts`](examples/08-functional-services-and-destroyref.ts) — Composable functional services with automatic `DestroyRef` teardown.
