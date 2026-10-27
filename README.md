<p align="center">
  <a href="https://worldgyan.com">
    <img src="assets/logo-banner.png" alt="WorldGyan - Next-Gen AI & Engineering" width="640" />
  </a>
</p>

# Angular Interview & Study Guide — worldgyan.com

Welcome to the **Angular Interview & Deep Dive Study Guide**, curated for frontend developers preparing for Senior, Lead, and Principal Angular engineering interviews.

This repository is organized into **modular topic folders**. Each topic has its own dedicated directory containing in-depth concept breakdowns, interview Q&A, and practical TypeScript/Angular code examples.

---

## 🗂️ Topics & Modules

### 1. 📡 [Angular Signals (`signals/`)](signals/README.md)
The modern reactivity model across Angular 16 – 22+ (including `linkedSignal`, `resource`, and default Zoneless).

- 📖 **Study Guide**: [`signals/README.md`](signals/README.md) (or [`signals/angular-signals-interview-guide.md`](signals/angular-signals-interview-guide.md))
- 📄 **Printable Vector PDF**: [`assets/angular-signals-complete-study-notes.pdf`](assets/angular-signals-complete-study-notes.pdf) — Complete 8-slide high-density plain canvas study deck.
- 💻 **Practical Examples**:
  - [`signals/examples/signals-basics.ts`](signals/examples/signals-basics.ts) — Writable signals (`signal()`, `.set()`, `.update()`) & immutability.
  - [`signals/examples/computed-and-dynamic-deps.ts`](signals/examples/computed-and-dynamic-deps.ts) — `computed()`, dynamic dependency tracking, memoization, `untracked()`, custom equality.
  - [`signals/examples/effects-and-cleanup.ts`](signals/examples/effects-and-cleanup.ts) — `effect()`, injection contexts, `onCleanup()`, and external API sync.
  - [`signals/examples/signal-component-apis.ts`](signals/examples/signal-component-apis.ts) — `input()`, `output()`, `model()`, and `viewChild()`.
  - [`signals/examples/rxjs-signal-interop.ts`](signals/examples/rxjs-signal-interop.ts) — `toSignal()` & `toObservable()` interop patterns.
  - [`signals/examples/change-detection-and-zoneless.ts`](signals/examples/change-detection-and-zoneless.ts) — `OnPush` with Signals & Zoneless bootstrap.
  - [`signals/examples/linked-signal-and-resource.ts`](signals/examples/linked-signal-and-resource.ts) — `linkedSignal()` & `resource()` / `rxResource()` (Angular 22 Stable).

---

### 2. 🏗️ [Angular 22 Project Architecture & Flow (`architecture/`)](architecture/README.md)
Step-by-step runtime lifecycle, modern application builder (`@angular/build:application`), `main.ts`, `app.config.ts`, `angular.json`, `package.json`, and the 3 types of builds (CSR, SSR, SSG).

- 📖 **Study Guide**: [`architecture/README.md`](architecture/README.md) (or [`architecture/angular-22-project-flow-architecture.md`](architecture/angular-22-project-flow-architecture.md))
- 💻 **Practical Examples**:
  - [`architecture/examples/main.ts`](architecture/examples/main.ts) — Modern standalone bootstrapApplication without AppModule or zone.js.
  - [`architecture/examples/app.config.ts`](architecture/examples/app.config.ts) — Enterprise ApplicationConfig with Zoneless, Router, native Fetch, and Event Replay.
  - [`architecture/examples/angular.json`](architecture/examples/angular.json) — Annotated modern Angular application builder manifest (Vite + esbuild).
  - [`architecture/examples/build-pipeline-and-deployment.sh`](architecture/examples/build-pipeline-and-deployment.sh) — CSR/SSR/SSG build scripts and Nginx production deployment config.

---

### 3. 🛡️ [HTTP Interceptors & Enterprise Authentication (`interceptors/`)](interceptors/README.md)
Functional `HttpInterceptorFn`, request/response onion-pipeline execution order, authentication strategies (JWT Bearer, OAuth 2.0 PKCE, HttpOnly Cookie Sessions), 401 silent refresh mutex queues without race conditions, and functional route guards.

- 📖 **Study Guide**: [`interceptors/README.md`](interceptors/README.md) (or [`interceptors/angular-interceptors-authentication.md`](interceptors/angular-interceptors-authentication.md))
- 💻 **Practical Examples**:
  - [`interceptors/examples/auth.interceptor.ts`](interceptors/examples/auth.interceptor.ts) — Bearer token injection with domain whitelisting and bypass context.
  - [`interceptors/examples/refresh-token-mutex.interceptor.ts`](interceptors/examples/refresh-token-mutex.interceptor.ts) — Concurrency mutex lock and 401 replay queue.
  - [`interceptors/examples/error-retry.interceptor.ts`](interceptors/examples/error-retry.interceptor.ts) — Exponential backoff retry and global error dispatch.
  - [`interceptors/examples/logging-telemetry.interceptor.ts`](interceptors/examples/logging-telemetry.interceptor.ts) — High-resolution network latency measurement & correlation ID tracing.
  - [`interceptors/examples/caching.interceptor.ts`](interceptors/examples/caching.interceptor.ts) — In-memory TTL response caching for idempotent GET requests.
  - [`interceptors/examples/loading-spinner.interceptor.ts`](interceptors/examples/loading-spinner.interceptor.ts) — Active request counter driving UI spinners via `finalize()`.
  - [`interceptors/examples/security-headers.interceptor.ts`](interceptors/examples/security-headers.interceptor.ts) — Custom security headers & CSRF protection.
  - [`interceptors/examples/auth.guard.ts`](interceptors/examples/auth.guard.ts) — Modern `CanActivateFn` with query param redirection.
  - [`interceptors/examples/auth.service.ts`](interceptors/examples/auth.service.ts) — Signal-based `AuthService` with $O(1)$ reactive state.

---

### 4. ⚡ [Change Detection, View Encapsulation & Browser Painting Pipeline (`change-detection/`)](change-detection/README.md)
Default vs OnPush, `provideZonelessChangeDetection()`, Push-Pull Signal reactive graph, continuous high-frequency WebSockets, unsubscription standards (`toSignal`, `takeUntilDestroyed`), component communication, `ViewEncapsulation` (Emulated, ShadowDom, None) CSS scoping rules, and step-by-step browser paint lifecycle.

- 📖 **Study Guide**: [`change-detection/README.md`](change-detection/README.md) (or [`change-detection/angular-change-detection-rendering-guide.md`](change-detection/angular-change-detection-rendering-guide.md))
- 💻 **Practical Examples**:
  - [`change-detection/examples/01-default-vs-onpush.ts`](change-detection/examples/01-default-vs-onpush.ts) — Default vs OnPush, shallow reference equality, immutable updates, and `detach()`.
  - [`change-detection/examples/02-zoneless-change-detection.ts`](change-detection/examples/02-zoneless-change-detection.ts) — `provideZonelessChangeDetection()`, microtask scheduling, and Zoneless timers.
  - [`change-detection/examples/03-signals-reactive-graph.ts`](change-detection/examples/03-signals-reactive-graph.ts) — Push-Pull reactive dependency graph and Diamond Problem resolution.
  - [`change-detection/examples/04-continuous-streams-websocket.ts`](change-detection/examples/04-continuous-streams-websocket.ts) — High-frequency WebSocket ticker with RxJS throttling and `toSignal()`.
  - [`change-detection/examples/05-parent-child-adjacent-communication.ts`](change-detection/examples/05-parent-child-adjacent-communication.ts) — Modern `input()`, `output()`, and root shared signal stores.
  - [`change-detection/examples/06-view-encapsulation-css-scoping.ts`](change-detection/examples/06-view-encapsulation-css-scoping.ts) — Emulated vs ShadowDom, `:host`, and CSS variable inheritance.
  - [`change-detection/examples/07-browser-paint-lifecycle-benchmark.ts`](change-detection/examples/07-browser-paint-lifecycle-benchmark.ts) — Avoiding layout thrashing, DOM batching, and GPU composite profiling.

---

### 5. 💉 [Services & Dependency Injection (`dependency-injection/`)](dependency-injection/README.md)
Modern `inject()` API, Hierarchical Injector Trees (ElementInjector vs EnvironmentInjector), 8 types of services and provider scopes (`providedIn: 'root'`, `'platform'`, `'any'`, `providers`, `viewProviders`), resolution modifiers (`optional`, `self`, `skipSelf`, `host`), tree-shakable `InjectionToken` factories, `DestroyRef` teardown, and Signal state stores.

- 📖 **Study Guide**: [`dependency-injection/README.md`](dependency-injection/README.md) (or [`dependency-injection/angular-services-dependency-injection-guide.md`](dependency-injection/angular-services-dependency-injection-guide.md))
- 💻 **Practical Examples**:
  - [`dependency-injection/examples/01-inject-function-vs-constructor.ts`](dependency-injection/examples/01-inject-function-vs-constructor.ts) — Modern `inject()` API, field initializers, type inference, and `runInInjectionContext()`.
  - [`dependency-injection/examples/02-injector-hierarchy-resolution.ts`](dependency-injection/examples/02-injector-hierarchy-resolution.ts) — ElementInjector vs EnvironmentInjector traversal, NullInjector fallback.
  - [`dependency-injection/examples/03-service-scopes-and-providers.ts`](dependency-injection/examples/03-service-scopes-and-providers.ts) — `providedIn: 'root'`, `'platform'`, `'any'`, and component-level providers.
  - [`dependency-injection/examples/04-providers-vs-viewproviders.ts`](dependency-injection/examples/04-providers-vs-viewproviders.ts) — Content projection isolation and UI library widget token shielding.
  - [`dependency-injection/examples/05-resolution-modifiers-self-host.ts`](dependency-injection/examples/05-resolution-modifiers-self-host.ts) — `optional`, `self`, `skipSelf`, `host`, and recursive tree node linking.
  - [`dependency-injection/examples/06-injection-tokens-and-factories.ts`](dependency-injection/examples/06-injection-tokens-and-factories.ts) — Tree-shakable `InjectionToken` with factories, `useExisting`, and `multi: true`.
  - [`dependency-injection/examples/07-signal-store-service-pattern.ts`](dependency-injection/examples/07-signal-store-service-pattern.ts) — Reactive signal store service, $O(1)$ reactivity, Zoneless ready.
  - [`dependency-injection/examples/08-functional-services-and-destroyref.ts`](dependency-injection/examples/08-functional-services-and-destroyref.ts) — Composable functional services with automatic `DestroyRef` teardown.

---

### 6. 📝 [Forms Architecture: Template-Driven, Strictly Typed Reactive & Signal Forms (`forms/`)](forms/README.md)
Unified `AbstractControl` state container (`value`, `status`, `dirty`/`pristine`, `touched`/`untouched`), comparison of the 3 form paradigms, `NonNullableFormBuilder`, dynamic `FormArray` & `FormRecord`, synchronous/debounced async with switchMap & cross-field validation, `ControlValueAccessor` (CVA) vs Signal `model()`, and pure Signal form architecture with `linkedSignal()` draft resets.

- 📖 **Study Guide**: [`forms/README.md`](forms/README.md) (or [`forms/angular-forms-architecture-guide.md`](forms/angular-forms-architecture-guide.md))
- 💻 **Practical Examples**:
  - [`forms/examples/01-template-driven-form-basics.ts`](forms/examples/01-template-driven-form-basics.ts) — Template-driven newsletter subscription with `[(ngModel)]` and template reference variables.
  - [`forms/examples/02-typed-reactive-form-validation.ts`](forms/examples/02-typed-reactive-form-validation.ts) — Enterprise Checkout Payment Form using `NonNullableFormBuilder`, regex pattern matching, and `getRawValue()`.
  - [`forms/examples/03-dynamic-form-array.ts`](forms/examples/03-dynamic-form-array.ts) — Dynamic line items & purchase invoice editor with `FormArray` and live financial calculations.
  - [`forms/examples/04-async-validator-unique-email.ts`](forms/examples/04-async-validator-unique-email.ts) — Debounced async validator with `timer(400)` and `switchMap` cancellation for unique corporate email checks.
  - [`forms/examples/05-cross-field-password-validator.ts`](forms/examples/05-cross-field-password-validator.ts) — Synchronous group-level cross-field validation comparing `newPassword` and `confirmPassword`.
  - [`forms/examples/06-control-value-accessor-custom-input.ts`](forms/examples/06-control-value-accessor-custom-input.ts) — 5-star risk rating widget implementing `ControlValueAccessor` compared to modern Angular 22 `model()`.
  - [`forms/examples/07-reactive-forms-to-signals-interop.ts`](forms/examples/07-reactive-forms-to-signals-interop.ts) — Bridging Reactive Forms into Signals using `toSignal()` with $O(1)$ computed pricing and volume discounts.
  - [`forms/examples/08-pure-signal-forms-architecture.ts`](forms/examples/08-pure-signal-forms-architecture.ts) — Pure Signal forms architecture using `signal()`, `linkedSignal()` for draft state resets, and `computed()` validation.

---

## ⚡ Quick Cheat Sheet: Forms Architecture (Angular 22)

| Architecture Concern | Template-Driven Forms | Strictly Typed Reactive Forms | Signal Forms (Modern Angular 22) |
| :--- | :--- | :--- | :--- |
| **Primary Module / Import** | `FormsModule` | `ReactiveFormsModule` | `@angular/core` (`signal`, `computed`, `linkedSignal`) |
| **Model Creation** | Implicit / Asynchronous in template (`[(ngModel)]`) | Explicit / Synchronous in TypeScript (`new FormGroup({...})`) | Declarative Signal graph (`signal()`, `linkedSignal()`) |
| **Source of Truth** | HTML Template directives (`#form="ngForm"`) | TypeScript Component model (`FormGroup`) | Writable & Computed Signal state |
| **Type Safety** | Loose / Template-inferred (`any` historically) | Strict compile-time TypeScript (`FormGroup<{...}>`) | Pure native TypeScript type inference |
| **Reactivity Primitive** | Asynchronous events via two-way binding | RxJS Observables (`valueChanges`, `statusChanges`) | Push-pull synchronous Signals ($O(1)$) |
| **Change Detection** | Requires Zone.js / event-driven checks | Zone.js or RxJS `\| async` bridge | Native Zoneless compatible ($O(1)$ surgical updates) |
| **Dynamic Form Controls** | Difficult (requires template directive loops) | Native via `FormArray` and `FormRecord` | Native via mutable array signals `signal<T[]>([])` |
| **Testability** | Requires DOM rendering & asynchronous fixtures | 100% unit testable in pure TypeScript without DOM | 100% unit testable synchronously without DOM |
| **Best Production Use Case** | Simple search filters, login, single-field inputs | Multi-step checkout wizards, complex dynamic enterprise forms | High-frequency dashboards, zoneless forms, modern signal apps |

---

## ⚡ Quick Cheat Sheet: Services & Dependency Injection Architecture (Angular 22)

| Architecture Concern | What Problem It Solves | Real-World Production Scenario | Modern Angular 22 Syntax |
| :--- | :--- | :--- | :--- |
| **Service Class** | Eliminates 1,000-line components and duplicate API/state logic across pages. | Shared `AuthService` managing JWT tokens and user permissions across Header, Profile, and Checkout. | `@Injectable({ providedIn: 'root' })` |
| **Dependency Injection (DI)** | Eliminates manual `new Svc(a, b, c)` instantiation and tight coupling. | Automatically wires `HttpClient` into `OrderService` without consumer needing to know dependencies. | `private order = inject(OrderService);` |
| **`inject()` API** | Replaces clunky constructor parameter lists and removes TypeScript reflection metadata. | Clean field initializers; simplifies inheritance without `super(a, b, c)`. | `private http = inject(HttpClient);` |
| **`providedIn: 'root'`** | Ensures single app-wide instance; **tree-shakable** (dropped if unreferenced). | Global application state, theme preferences, analytics pipelines. | `@Injectable({ providedIn: 'root' })` |
| **Component `providers: []`** | Isolates state per component instance; automatically cleaned up on unmount. | Multistep checkout wizard draft (`CheckoutDraftService`), isolated form state. | `@Component({ providers: [DraftService] })` |
| **Component `viewProviders: []`** | Restricts service access to component template; **shields from projected `<ng-content>`**. | UI widget library (e.g. Accordion/Modal) protecting internal state from external slot markup. | `@Component({ viewProviders: [ModalState] })` |
| **`useClass`** | Swaps implementation at runtime (Strategy Pattern). | Providing `MockPaymentGateway` during local unit tests instead of `StripeGateway`. | `{ provide: Gateway, useClass: MockGateway }` |
| **`useExisting`** | Aliases one token to an existing singleton without duplicating instances. | Refactoring legacy `UserService` to `UserProfileService` while sharing the exact same instance. | `{ provide: OldSvc, useExisting: NewSvc }` |
| **`useValue`** | Injects static configurations, primitives, or environment URLs. | Multi-environment API endpoint URLs, feature flag objects. | `{ provide: API_URL, useValue: env.apiUrl }` |
| **`useFactory`** | Computes dependency dynamically at runtime using injected dependencies. | Initializing third-party telemetry SDK requiring runtime authorization token. | `{ provide: SDK, useFactory: (auth) => ... }` |
| **`takeUntilDestroyed()`** | Prevents memory leaks by auto-canceling RxJS streams when component/service dies. | Live stock ticker or WebSocket subscription in a component-scoped service. | `stream$.pipe(takeUntilDestroyed())` |

---

## ⚡ Quick Cheat Sheet: Change Detection & Rendering (Angular 22)

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
| **High-Frequency Streams** | `ngZone.runOutsideAngular()` + manual `detectChanges()` | `toSignal(stream$.pipe(throttleTime(60)))` | Batches continuous events (e.g. 50/sec WebSockets) into human visual perception frames (16ms/60ms) without frame drops or 100% CPU lockup. |
| **Observable Cleanup** | `ngOnDestroy` + `takeUntil(destroy$)` | `takeUntilDestroyed()` or `toSignal()` | Automated unsubscription tied to `DestroyRef`; guarantees zero memory leaks or orphaned subscriptions. |
| **Component Communication** | `@Input()` / `@Output() EventEmitter` | `input()`, `output()`, Shared Signal Service | Type-safe signal inputs/outputs; sibling components communicate seamlessly via root signal stores without parent prop-drilling. |
| **Browser Painting Budget** | Top-down dirty check triggers DOM reflows | Microtask batching $\to$ Ivy DOM patch $\to$ GPU composite | Ivy patches only changed DOM nodes. Minimizes browser layout thrashing; maximizes 60fps/120fps display frame budgets. |

---

## ⚡ Quick Cheat Sheet: Interceptors & Authentication

| Concern / Capability | Legacy Angular (< v15) | Modern Angular 22 (v16–v22+) | Architectural Impact |
| :--- | :--- | :--- | :--- |
| **Interceptor Type** | Class implementing `HttpInterceptor` | Functional `HttpInterceptorFn` | Tree-shakable, zero class boilerplate, composable via closures. |
| **Registration** | `providers: [{ provide: HTTP_INTERCEPTORS, useClass: ... }]` | `provideHttpClient(withInterceptors([...]))` | Registered in `app.config.ts`; strict deterministic left-to-right execution. |
| **Token Injection** | Mutating headers across individual services | Centralized in `authInterceptor` | Zero token leakage; single place to update or rotate keys. |
| **401 Token Refresh** | Manual retry logic or fragile subjects | `catchError` + `switchMap` replay mutex | Silently refreshes expired tokens; user experiences zero interruption or logout. |
| **Auth State Model** | BehaviorSubject in singleton service | `signal<User \| null>(null)` + `computed()` | Fine-grained $O(1)$ reactivity; integrates seamlessly with Zoneless change detection. |
| **Route Protection** | Class implementing `CanActivate` | Functional `CanActivateFn` | Uses `inject(AuthService)` directly; avoids guard class instantiation overhead. |

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
- [x] 🏗️ **Project Architecture & Flow** (`architecture/`)
- [x] 🛡️ **HTTP Interceptors & Enterprise Authentication** (`interceptors/`)
- [x] ⚡ **Change Detection & Rendering** (`change-detection/`)
- [x] 🏎️ **Performance & Change Detection** (`change-detection/` - `OnPush`, detaching change detector, batching)
- [x] 💉 **Dependency Injection** (`dependency-injection/` - `inject()`, hierarchical injectors, 8 service types, viewProviders)
- [x] 📝 **Forms Architecture** (`forms/` - Template-Driven, Typed Reactive, Signal Forms, FormArray, CVA, linkedSignal)
- [ ] 🔀 **Modern Control Flow** (`control-flow/` - `@if`, `@for`, `@defer`)
- [ ] 🌐 **SSR & Hydration** (`ssr-hydration/` - Event replay, incremental hydration)
