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

## ⚡ Quick Cheat Sheet: Services & Dependency Injection (Angular 22 Made Simple)

| Question / Concept | Modern Angular 22 | Plain English Explanation | Real-World Analogy |
| :--- | :--- | :--- | :--- |
| **What is a Service?** | `@Injectable({ providedIn: 'root' })` | Centralizes business logic, API calls, and state outside components. | Kitchen Chef: cooks the food so the waiter doesn't have to. |
| **What is DI?** | Framework delivers instances automatically | Angular manages creation & lifecycle; never write `new MyService()`. | Room service: dial for coffee; someone delivers it ready to drink. |
| **`inject()` vs Constructor** | `private s = inject(Svc);` | Eliminates constructor parameter bloat, improves type inference. | Old: Filling 5-page paper form. New: 1-click order. |
| **Root Scope** | `providedIn: 'root'` | App-wide singleton. Bundler drops it if unused (Tree-shakable). | Main building elevator: everyone in the building uses the same one. |
| **Component Scope** | `@Component({ providers: [Svc] })` | Fresh instance per component; shared with child components. | Private room keycard: each hotel guest gets their own unique copy. |
| **View Isolation** | `@Component({ viewProviders: [Svc] })` | Fresh instance for component view; **hidden** from `<ng-content>`. | Staff-only kitchen door: guests in dining room cannot touch or see inside. |
| **Optional Resolution** | `inject(Svc, { optional: true })` | Returns `null` if not found anywhere instead of crashing. | "Do you have ketchup? If not, no worries, I'll eat without it." |
| **SkipSelf Resolution** | `inject(Svc, { skipSelf: true })` | Skips current component; looks at parent element. | "Ask my manager, don't ask me." (Essential for recursive folder trees). |
| **Memory Cleanup** | `.pipe(takeUntilDestroyed())` | Auto-cancels subscriptions when component or service is destroyed. | Sleep timer that turns off the TV automatically when you leave. |

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
- [ ] 🔀 **Modern Control Flow** (`control-flow/` - `@if`, `@for`, `@defer`)
- [ ] 🌐 **SSR & Hydration** (`ssr-hydration/` - Event replay, incremental hydration)
