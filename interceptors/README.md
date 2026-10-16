# Angular HTTP Interceptors & Enterprise Authentication Guide

Welcome to the **Angular HTTP Interceptors & Enterprise Authentication Guide**, designed for frontend engineers preparing for Senior, Lead, and Principal Angular engineering interviews.

> **Core Philosophy:** In modern Angular (v16–v22+), legacy class-based `HttpInterceptor` with `HTTP_INTERCEPTORS` multi-providers has been replaced by lightweight, composable, functional **`HttpInterceptorFn`** registered via `provideHttpClient(withInterceptors([...]))`. Interceptors centralize cross-cutting transport concerns—such as security token injection, 401 retry loops, global error reporting, and latency telemetry—keeping UI components and domain services completely decoupled from network plumbing.

---

## 📑 Table of Contents
1. [⚡ 60-Second Executive Cheat Sheet](#1--60-second-executive-cheat-sheet)
2. [🔄 Interceptor Onion Pipeline Architecture](#2--interceptor-onion-pipeline-architecture)
3. [🛠️ The 7 Types of HTTP Interceptors in Production](#3--the-7-types-of-http-interceptors-in-production)
4. [🔐 Authentication Strategies Comparison Matrix](#4--authentication-strategies-comparison-matrix)
5. [🔁 Silent Refresh Token Rotation & Mutex Replay Queue](#5--silent-refresh-token-rotation--mutex-replay-queue)
6. [🛡️ Functional Route Guards (`CanActivateFn`) & Signal-Based AuthService](#6--functional-route-guards-canactivatefn--signal-based-authservice)
7. [🎯 Senior & Principal Architect Interview Q&A](#7--senior--principal-architect-interview-qa)
8. [💻 Practical TypeScript Examples](#8--practical-typescript-examples)

---

## 1. ⚡ 60-Second Executive Cheat Sheet

| Concern / Capability | Legacy Angular (< v15) | Modern Angular 22 (v16–v22+) | Architectural Impact |
| :--- | :--- | :--- | :--- |
| **Interceptor Type** | Class implementing `HttpInterceptor` | Functional `HttpInterceptorFn` | Tree-shakable, zero class boilerplate, composable via closures. |
| **Registration** | `providers: [{ provide: HTTP_INTERCEPTORS, useClass: ... }]` | `provideHttpClient(withInterceptors([...]))` | Registered in `app.config.ts`; strict deterministic left-to-right execution. |
| **Token Injection** | Mutating headers across individual services | Centralized in `authInterceptor` | Zero token leakage; single place to update or rotate keys. |
| **401 Token Refresh** | Manual retry logic or fragile subjects | `catchError` + `switchMap` replay mutex | Silently refreshes expired tokens; user experiences zero interruption or logout. |
| **Auth State Model** | BehaviorSubject in singleton service | `signal<User \| null>(null)` + `computed()` | Fine-grained $O(1)$ reactivity; integrates seamlessly with Zoneless change detection. |
| **Route Protection** | Class implementing `CanActivate` | Functional `CanActivateFn` | Uses `inject(AuthService)` directly; avoids guard class instantiation overhead. |

---

## 2. 🔄 Interceptor Onion Pipeline Architecture

An **HTTP Interceptor** is a middleware function that sits between your Angular application and the remote API. Whenever `HttpClient` initiates an HTTP request or receives a response, it passes through an ordered chain of interceptors:

```
[Component / Service]
         │
         ▼  (1. Request Flow — Left to Right / FIFO)
[loggingInterceptor] ➔ [authInterceptor] ➔ [cachingInterceptor]
                                                    │
                                                    ▼
                                           [Remote API Gateway]
                                                    │
         ▲  (2. Response Flow — Right to Left / LIFO)
[Component / Signal] ⮜ [timingInterceptor] ⮜ [errorInterceptor]
```

### Key Onion Model Rules:
1. **Outbound Requests:** Execute in **FIFO order** (First-In, First-Out). The first interceptor in `withInterceptors([A, B])` receives the request first.
2. **Inbound Responses:** Execute in **LIFO order** (Last-In, First-Out, onion model). Interceptor `B` intercepts the server response first, handles or transforms it, and then passes it back up to `A`.
3. **Immutability Invariant:** In Angular, `HttpRequest` objects are strictly **immutable**. To modify headers or URLs, you must call `req.clone({ setHeaders: { ... } })`.

---

## 3. 🛠️ The 7 Types of HTTP Interceptors in Production

| # | Interceptor Type | Purpose | Primary Operators / APIs |
| :- | :--- | :--- | :--- |
| **1** | **Authentication** | Injects `Authorization: Bearer <token>` into trusted API calls. | `req.clone({ setHeaders })`, `inject(AuthService)` |
| **2** | **Silent Refresh Mutex** | Catches `401 Unauthorized`, locks concurrent requests, calls `/auth/refresh`, and replays failed requests. | `catchError`, `switchMap`, `BehaviorSubject`, `filter`, `take(1)` |
| **3** | **Error & Retry** | Exponential backoff retry on idempotent GETs and global toast notification. | `retry({ delay, count })`, `catchError` |
| **4** | **Logging & Latency** | Measures network roundtrip time and logs HTTP telemetry. | `performance.now()`, `tap(event => ...)` |
| **5** | **In-Memory Caching** | Caches immutable GET responses in a TTL Map to avoid duplicate network calls. | `Map<string, CacheEntry>`, `of(cachedResponse.clone())` |
| **6** | **Loading Spinner** | Drives global loading indicator by incrementing/decrementing an active request counter. | `finalize(() => loadingService.decrement())` |
| **7** | **Security & CSRF** | Injects CSRF tokens (`X-XSRF-TOKEN`) and client version identifiers. | `req.clone({ setHeaders: { 'X-Requested-With': ... } })` |

---

## 4. 🔐 Authentication Strategies Comparison Matrix

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AUTHENTICATION TAXONOMY                         │
├────────────────────┬────────────────────┬──────────────────────────────┤
│ 1. JWT Bearer      │ 2. OAuth 2.0 PKCE  │ 3. HttpOnly Session Cookies  │
│ Stateless Tokens   │ Delegated SSO      │ Browser Cookie Jar           │
│ Microservices      │ Enterprise IdPs    │ BFF Pattern (Baking/Finance) │
└────────────────────┴────────────────────┴──────────────────────────────┘
```

| Strategy | Token Storage | XSS Risk | CSRF Risk | Scalability | Best Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **JWT Bearer (Stateless)** | In-Memory Signal / Closure | Low (if kept out of localStorage) | Zero (Custom header required) | High (Zero backend session lookup) | Microservices, public mobile + web APIs |
| **OAuth 2.0 + OIDC (PKCE)** | Memory + SessionStorage | Zero client secret exposure | Zero (Auth code exchange) | High (Standardized token lifecycle) | Enterprise SSO (Auth0, Okta, Keycloak, Google) |
| **HttpOnly Cookie Sessions** | Browser Cookie Jar | **Zero** (JS cannot read cookie) | Requires `SameSite=Strict` + CSRF token | Medium (Session store on backend) | Banking, healthcare, high-security portals |
| **API Key / Mutual TLS** | Environment / Secret Manager | High if embedded in client | Zero | High | Backend-to-Backend or Server-Side Rendering (SSR) |

> [!CAUTION]
> **Never store JWTs in `localStorage` or `sessionStorage` in production.** Any XSS vulnerability or malicious NPM package can execute `localStorage.getItem('token')` and exfiltrate credentials. Keep access tokens in memory (private signal) and use `HttpOnly` cookies for refresh tokens.

---

## 5. 🔁 Silent Refresh Token Rotation & Mutex Replay Queue

When multiple parallel requests fail with `401 Unauthorized` simultaneously:
1. **The Race Trap:** Calling `/auth/refresh` 4 times concurrently triggers token reuse detection and invalidates the session.
2. **The Mutex Solution:**
   - Maintain an `isRefreshing = false` lock variable and a `refreshTokenSubject = new BehaviorSubject<string | null>(null)`.
   - The first request flips `isRefreshing = true` and invokes `authService.refreshToken()`.
   - Subsequent requests see `isRefreshing === true` and queue behind `refreshTokenSubject.pipe(filter(t => t !== null), take(1))`.
   - When the refresh completes, the new token is emitted into the Subject, unlocking all queued requests to replay cleanly.

---

## 6. 🛡️ Functional Route Guards (`CanActivateFn`) & Signal-Based AuthService

### Functional Route Guard (`src/app/core/guards/auth.guard.ts`)
```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};
```

---

## 7. 🎯 Senior & Principal Architect Interview Q&A

### Q1: What is the primary difference between class-based `HttpInterceptor` and modern `HttpInterceptorFn`?
**Answer:** Class-based interceptors required registering classes with `{ provide: HTTP_INTERCEPTORS, useClass: ..., multi: true }`. This prevented efficient tree-shaking because Angular could not know at build time which methods of the class were invoked. Functional interceptors (`HttpInterceptorFn`) are pure TypeScript functions registered via `withInterceptors([fn1, fn2])`. They compile to concise JavaScript, support closure-based dependency injection via `inject()`, and execute in strict left-to-right array order.

---

### Q2: What is the exact execution order of multiple interceptors during a request and response cycle?
**Answer:** Outbound requests execute in **FIFO order** (First-In, First-Out): the first interceptor in `withInterceptors([A, B])` receives the request first. Inbound responses execute in **LIFO order** (Last-In, First-Out, like an onion): interceptor `B` receives the response stream from the server before passing it back up to `A`.

---

### Q3: Why must HTTP requests be cloned inside an interceptor using `req.clone()`?
**Answer:** In Angular, `HttpRequest` objects are strictly **immutable**. This design ensures that if a request is retried, replayed, or cached, downstream interceptors or retry operators receive the original pristine state rather than a corrupted, partially mutated object. To add headers or modify the URL, you must call `req.clone({ setHeaders: { ... } })`.

---

### Q4: How do you bypass a specific interceptor (e.g. Auth) for public endpoints?
**Answer:** Use `HttpContext` and `HttpContextToken`.
```typescript
export const BYPASS_AUTH = new HttpContextToken<boolean>(() => false);

// In service:
this.http.get('/public/data', {
  context: new HttpContext().set(BYPASS_AUTH, true)
});

// Inside authInterceptor:
if (req.context.get(BYPASS_AUTH)) {
  return next(req);
}
```

---

### Q5: How do you prevent infinite 401 loops in a refresh token interceptor?
**Answer:** Check the outgoing URL before attempting a refresh:
```typescript
if (error.status === 401 && !req.url.includes('/auth/refresh')) {
  // Safe to refresh
} else if (error.status === 401 && req.url.includes('/auth/refresh')) {
  // The refresh token itself is invalid; force immediate logout
  authService.logout();
}
```

---

## 8. 💻 Practical TypeScript Examples

Explore the complete production-grade TypeScript implementations in [`examples/`](examples/):
- [`examples/auth.interceptor.ts`](examples/auth.interceptor.ts) — Bearer token injection with domain whitelisting and bypass context.
- [`examples/refresh-token-mutex.interceptor.ts`](examples/refresh-token-mutex.interceptor.ts) — Concurrency mutex lock and 401 replay queue.
- [`examples/error-retry.interceptor.ts`](examples/error-retry.interceptor.ts) — Exponential backoff retry and global error dispatch.
- [`examples/logging-telemetry.interceptor.ts`](examples/logging-telemetry.interceptor.ts) — High-resolution network latency measurement.
- [`examples/caching.interceptor.ts`](examples/caching.interceptor.ts) — In-memory TTL response caching.
- [`examples/loading-spinner.interceptor.ts`](examples/loading-spinner.interceptor.ts) — Active request counter driving UI spinners.
- [`examples/security-headers.interceptor.ts`](examples/security-headers.interceptor.ts) — Custom security headers & CSRF injection.
- [`examples/auth.guard.ts`](examples/auth.guard.ts) — Modern `CanActivateFn` with query param redirection.
- [`examples/auth.service.ts`](examples/auth.service.ts) — Signal-based `AuthService` with $O(1)$ reactive state.
