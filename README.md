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
- [ ] ⚡ **Zoneless Angular** (`zoneless/`)
- [ ] 🔀 **Modern Control Flow** (`control-flow/` - `@if`, `@for`, `@defer`)
- [ ] 💉 **Dependency Injection** (`dependency-injection/` - `inject()`, hierarchical injectors)
- [ ] 🌐 **SSR & Hydration** (`ssr-hydration/` - Event replay, incremental hydration)
- [ ] 🏎️ **Performance & Change Detection** (`performance/` - `OnPush`, detaching change detector)
