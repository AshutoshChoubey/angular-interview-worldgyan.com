# Angular 22 Services & Dependency Injection Architecture: Real-World Field Notes

> **Core Architectural Principle:**  
> **Separation of Concerns (SoC) + Inversion of Control (IoC).**  
> UI Components should only care about user interactions and rendering state to the DOM. Heavy business logic, state synchronization, HTTP communication, and external API coordination belong in **Services**, orchestrated and delivered automatically by Angular's **Dependency Injection (DI)** engine.

---

## 📑 Table of Contents
1. [⚡ 60-Second Executive Cheat Sheet](#1--60-second-executive-cheat-sheet)
2. [🎯 Real-World Problem: Why Do We Need Services?](#2--real-world-problem-why-do-we-need-services)
3. [💉 Why Dependency Injection (DI) & What Problem Does It Solve?](#3--why-dependency-injection-di--what-problem-does-it-solve)
4. [🏛️ 5 Core Software Design Patterns in Angular DI](#4--5-core-software-design-patterns-in-angular-di)
5. [📦 6 Types of Services & Provider Scopes](#5--6-types-of-services--provider-scopes)
6. [🛠️ Provider Recipes: `useClass`, `useExisting`, `useValue`, `useFactory`](#6--provider-recipes-useclass-useexisting-usevalue-usefactory)
7. [🚀 Modern `inject()` API vs Constructor & The Injection Context Rule](#7--modern-inject-api-vs-constructor--the-injection-context-rule)
8. [🌲 The 2 Hierarchical Injector Trees (Element vs Environment)](#8--the-2-hierarchical-injector-trees-element-vs-environment)
9. [🔍 Resolution Modifiers in Real-World Use Cases](#9--resolution-modifiers-in-real-world-use-cases)
10. [🧹 Preventing Memory Leaks with `takeUntilDestroyed()`](#10--preventing-memory-leaks-with-takeuntildestroyed)
11. [🎯 16 Real-World Enterprise Interview Questions & Answers](#11--16-real-world-enterprise-interview-questions--answers)
12. [💻 Practical TypeScript Examples](#12--practical-typescript-examples)
13. [🎬 LinkedIn Animated GIFs & Visual Assets (Ready for Download & Upload)](#13--linkedin-animated-gifs--visual-assets-ready-for-download--upload)

---

## 1. ⚡ 60-Second Executive Cheat Sheet

| Architecture Concern | What Problem It Solves | Real-World Scenario | Modern Angular 22 Syntax |
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

## 2. 🎯 Real-World Problem: Why Do We Need Services?

### ❌ The Anti-Pattern: Component Doing Everything
Imagine an enterprise e-commerce app where the `CheckoutComponent` handles its own HTTP requests, token decoding, and cart calculations:

```typescript
// ❌ ANTI-PATTERN: Bloated, tightly coupled, impossible to test
export class CheckoutComponent {
  cartItems = [];
  user = null;

  async ngOnInit() {
    // 1. Manually fetch user
    const userRes = await fetch('/api/user', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    this.user = await userRes.json();

    // 2. Manually fetch cart
    const cartRes = await fetch('/api/cart');
    this.cartItems = await cartRes.json();

    // 3. Duplicate tax & discount logic here...
  }
}
```

**Disasters caused by this approach:**
- **Code Duplication:** The `HeaderNavComponent` and `ProductDetailComponent` must copy-paste the exact same user fetching and token handling code.
- **State Fragmentation:** Updating the cart in one component does not reflect in the navigation bar.
- **Untestable UI:** Unit testing the component template requires mocking global `fetch` and browser `localStorage`.

### ✅ The Production Solution: Centralized Service
Extract all business logic and reactive state into an `@Injectable()` service:

```typescript
// src/app/core/services/cart.service.ts
import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);

  // Private mutable signal state
  private readonly _items = signal<CartItem[]>([]);

  // Public read-only signals for consumers
  readonly items = this._items.asReadonly();
  readonly totalCount = computed(() => this._items().reduce((acc, item) => acc + item.quantity, 0));
  readonly totalPrice = computed(() => this._items().reduce((acc, item) => acc + item.price * item.quantity, 0));

  addItem(item: CartItem) {
    this._items.update(items => [...items, item]);
  }

  checkout() {
    return this.http.post('/api/checkout', { items: this._items() });
  }
}
```

Now, any component (`HeaderComponent`, `CheckoutComponent`, `MiniCartModal`) simply binds to `cartService.items()` or `cartService.totalPrice()`.

---

## 3. 💉 Why Dependency Injection (DI) & What Problem Does It Solve?

### ❌ Without DI: Manual Instantiation (`new Service()`)
What happens if components create their own services manually?

```typescript
// ❌ TIGHT COUPLING: Component must know how to construct every dependency
export class CheckoutComponent {
  private cartService = new CartService(
    new HttpClient(new HttpXhrBackend({ build: () => new XMLHttpRequest() })),
    new StorageService(new CryptoService())
  );
}
```

**Why manual instantiation fails in enterprise software:**
1. **Dependency Explosion:** If `CartService` adds a new `AnalyticsService` dependency, you must modify the `new CartService(...)` call in 50 different components!
2. **Broken Singleton State:** Calling `new CartService()` creates a brand-new instance every time—Header and Checkout would have completely different carts!
3. **Impossible Mocking:** In unit tests, you cannot easily swap `CartService` with a mock without refactoring component source code.

### ✅ With Angular DI: Inversion of Control (IoC)
You tell Angular what you need, and Angular's Injector builds it, manages its lifecycle, and supplies it:

```typescript
@Component({
  selector: 'app-checkout',
  standalone: true,
  template: `<p>Total: {{ cart.totalPrice() | currency }}</p>`
})
export class CheckoutComponent {
  // Angular delivers the shared singleton instance automatically!
  protected cart = inject(CartService);
}
```

---

## 4. 🏛️ 5 Core Software Design Patterns in Angular DI

| Design Pattern | How Angular Implements It | Real-World Enterprise Purpose |
| :--- | :--- | :--- |
| **Inversion of Control (IoC)** | Injector creates dependencies instead of classes instantiating them directly. | Decouples caller from callee; allows frictionless unit testing with mocks. |
| **Singleton Pattern** | `providedIn: 'root'` registers one shared application instance. | Guarantees a single source of truth for auth, cached user profiles, and active carts. |
| **Factory Pattern** | `useFactory: () => ...` creates dependencies dynamically at runtime. | Constructs complex SDK clients conditioned on environment variables or runtime features. |
| **Adapter / Facade Pattern** | `useExisting: NewService` aliases older tokens to unified implementations. | Enables continuous refactoring without breaking legacy consumer components. |
| **Strategy Pattern** | `useClass: MockGateway` swaps concrete implementations. | Swaps production payment gateways with test mocks in automated test suites. |

---

## 5. 📦 6 Types of Services & Provider Scopes

1. **Root Singleton (`providedIn: 'root'`):**
   - Shared across the entire single-page application.
   - **Tree-shakable:** Bundlers completely strip it if not referenced anywhere in application code.
2. **Component-Scoped (`providers: [Service]`):**
   - Brand-new instance instantiated per component mounting; automatically destroyed on unmount.
   - Shared with all child components in the template hierarchy.
   - *Example:* Multistep wizard draft state (`CheckoutDraftService`).
3. **View-Isolated (`viewProviders: [Service]`):**
   - Accessible strictly within the component's internal HTML template.
   - **Hidden from projected `<ng-content>` children.**
   - *Example:* Reusable UI widget library (Accordion/Modal) shielding internal state from external slots.
4. **Platform-Scoped (`providedIn: 'platform'`):**
   - Shared across multiple Angular applications mounted in the same window (Microfrontends).
5. **Signal Store State Service:**
   - Holds private mutable signals and exposes public `asReadonly()` signals and `computed()` projections.
6. **Functional Services (Composables):**
   - Standalone helper functions using `inject()` directly without class boilerplate (e.g. `injectCurrentUser()`).

---

## 6. 🛠️ Provider Recipes: `useClass`, `useExisting`, `useValue`, `useFactory`

| Recipe | Runtime Behavior | Real-World Use Case | Modern Angular 22 Syntax |
| :--- | :--- | :--- | :--- |
| **`useClass`** | Instantiates a brand-new instance of the target class. | Swapping `ProductionStripeService` with `MockPaymentService` during unit tests. | `{ provide: PaymentService, useClass: MockPaymentService }` |
| **`useExisting`** | Aliases an existing instance; shares the **exact same singleton**. | Refactoring legacy `UserSessionService` to `AuthService` without state duplication. | `{ provide: LegacySession, useExisting: AuthService }` |
| **`useValue`** | Injects a static object, string, or runtime configuration. | Environment configuration, base API endpoints, feature flag toggles. | `{ provide: API_BASE_URL, useValue: env.apiUrl }` |
| **`useFactory`** | Calls a factory function dynamically at runtime with injected dependencies. | Initializing third-party telemetry SDK requiring a runtime token from `AuthService`. | `{ provide: TelemetryClient, useFactory: (auth) => init(auth.token()), deps: [AuthService] }` |
| **`multi: true`** | Collects multiple providers into an array for the same token. | Registering custom routing guards, interceptors, or app initialization hooks. | `{ provide: APP_INITIALIZER, useFactory: ..., multi: true }` |

```typescript
// src/app/app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),

    // 1. Static Configuration Token
    { provide: API_ENDPOINT, useValue: 'https://api.worldgyan.com/v1' },

    // 2. Factory: Conditional initialization based on environment
    {
      provide: PaymentGateway,
      useFactory: () => {
        const env = inject(ENVIRONMENT);
        return env.production ? new StripeGateway() : new MockGateway();
      }
    },

    // 3. useExisting: Non-breaking migration alias
    { provide: LegacyAuthToken, useExisting: ModernAuthService }
  ]
};
```

---

## 7. 🚀 Modern `inject()` API vs Constructor & The Injection Context Rule

### Advantages of `inject()`:
- **Zero Constructor Boilerplate:** Initialize properties directly as class fields with automatic TypeScript type inference.
- **Clean Class Inheritance:** Subclasses don't need to forward 8 dependencies into `super(...)` just to add one new helper.
- **Functional Composables:** Create reusable custom utilities (e.g. `injectCurrentUser()`, `injectQueryParams()`) outside classes.

### ⚠️ The Injection Context Rule:
`inject()` must be executed synchronously during component/service instantiation (constructor or field initializers). Calling it inside a `setTimeout()`, click listener, or async Promise throws runtime error **`NG0203`**.

```typescript
import { Component, EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';

@Component({
  selector: 'app-checkout-summary',
  standalone: true,
  template: `<button (click)="loadDeferredAnalytics()">Calculate Taxes</button>`
})
export class CheckoutSummaryComponent {
  // ✅ 1. Standard Field Initialization (Inside Injection Context)
  private auth = inject(AuthService);
  private injector = inject(EnvironmentInjector);

  // ⚠️ 2. Handling Async / Deferred Injection Without NG0203 Error:
  async loadDeferredAnalytics() {
    const { HeavyTaxCalculatorService } = await import('./tax-calculator.service');

    // ✅ runInInjectionContext provides the required injector context dynamically:
    runInInjectionContext(this.injector, () => {
      const taxCalc = inject(HeavyTaxCalculatorService);
      console.log('Estimated Tax:', taxCalc.calculate(this.auth.userId()));
    });
  }
}
```

---

## 8. 🌲 The 2 Hierarchical Injector Trees (Element vs Environment)

Angular evaluates dependencies through two separate trees. It first climbs the **ElementInjector** tree (component HTML DOM hierarchy), and if unresolved, it **falls through** to the **EnvironmentInjector** tree:

```
[NullInjector] ➔ Throws NullInjectorError: No provider for Token!
      ▲
[PlatformInjector] ➔ Shared across multiple Angular apps on same page (Microfrontends)
      ▲
[Root EnvironmentInjector] ➔ providedIn: 'root' application-wide singletons
      ▲
====================== [Fall-through Boundary] ======================
      ▲
[Parent Component ElementInjector] ➔ Parent providers: [MyService]
      ▲
[Target Component ElementInjector] ➔ Target providers: [MyService]
```

1. **ElementInjector Tree:** Follows the HTML component template hierarchy upwards (Target Component $\to$ Parent Component $\to$ Root `<app-root>`).
2. **EnvironmentInjector Tree:** Follows routing configurations, module boundaries, and global bootstrapping (Route Environment $\to$ Root Environment $\to$ Platform $\to$ Null).
3. If not found in the ElementInjector tree, resolution **falls through** to the EnvironmentInjector where the component was instantiated.

---

## 9. 🔍 Resolution Modifiers in Real-World Use Cases

- **`{ optional: true }`**: If missing, returns `null` instead of throwing `NullInjectorError`. (Use case: Optional telemetry or theme override).
- **`{ self: true }`**: Inspects only the current host DOM element; does not search ancestors. (Use case: Custom form control inspecting its own `NgControl`).
- **`{ skipSelf: true }`**: Skips the current element and starts searching at the parent element. (Use case: Recursive components like a tree view `<app-folder-node>` locating its parent folder).
- **`{ host: true }`**: Restricts traversal to the component host boundary; does not leak into the outer application.

```typescript
// 1. optional: Prevent crashes when third-party telemetry is disabled
const analytics = inject(AnalyticsService, { optional: true });
analytics?.trackEvent('checkout_started');

// 2. self: Custom control validating its own attached directive
const control = inject(NgControl, { self: true });

// 3. skipSelf: Recursive nested folder tree item finding its parent folder
@Component({
  selector: 'app-folder-item',
  standalone: true,
  template: `
    <div [style.padding-left.px]="depth * 20">
      <span>{{ folderName }} (Level {{ depth }})</span>
      <ng-content />
    </div>
  `
})
export class FolderItemComponent {
  private parentFolder = inject(FolderItemComponent, { optional: true, skipSelf: true });
  readonly depth: number = this.parentFolder ? this.parentFolder.depth + 1 : 0;
}
```

---

## 10. 🧹 Preventing Memory Leaks with `takeUntilDestroyed()`

Component-scoped services that maintain RxJS streams, interval timers, or event listeners will leak memory if subscriptions outlive component destruction.

Modern Angular 22 cancels streams automatically without `ngOnDestroy()`:

```typescript
import { Injectable, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';

@Injectable() // Component-scoped
export class StockTickerService {
  constructor() {
    // 1. Automatically canceled when the providing component unmounts
    interval(1000)
      .pipe(takeUntilDestroyed())
      .subscribe(tick => console.log('Live Tick:', tick));

    // 2. Custom teardown registration
    inject(DestroyRef).onDestroy(() => {
      console.log('StockTickerService cleaned up successfully');
    });
  }
}
```

---

## 11. 🎯 16 Real-World Enterprise Interview Questions & Answers

### Q1: What real-world problem does Dependency Injection solve in Angular?
**Answer:** DI implements **Inversion of Control (IoC)**. Without DI, components must manually call `new Service(...)` and construct all transitive dependencies. DI allows classes to declare what they need, while Angular instantiates, configures, and shares singletons automatically. This decouples business logic from UI rendering, eliminates duplicate state across pages, and enables effortless unit testing with mock services.

### Q2: Why is `inject()` superior to constructor injection?
**Answer:** `inject()` removes bloated constructor parameter lists, provides automatic TypeScript type inference, eliminates `super(...)` parameter forwarding during class inheritance, and allows authoring composable functional utilities (custom hooks) outside class boundaries.

### Q3: What is the exact difference between `providers` and `viewProviders`?
**Answer:** Both create a fresh, component-scoped instance. However, `providers` is visible to both the component's own template and user content projected via `<ng-content>`. `viewProviders` isolates the service strictly to the component's internal HTML template, shielding internal state from projected consumer markup.

### Q4: What does `providedIn: 'root'` mean and why is it tree-shakable?
**Answer:** It registers the service as an application-wide singleton in the root `EnvironmentInjector`. It is **tree-shakable** because the service points to its provider rather than the module pointing to the service. If no component or file imports the service, JavaScript bundlers completely strip it from the final production bundle.

### Q5: What causes error `NG0203` and how do you resolve it?
**Answer:** `NG0203` occurs when `inject()` is called outside an active **Injection Context** (e.g. inside an asynchronous `setTimeout()`, click listener, or Promise callback). To fix it, call `inject()` in field initializers or constructor, or capture `EnvironmentInjector` and wrap the async callback in `runInInjectionContext(this.injector, () => { ... })`.

### Q6: When would you use `{ skipSelf: true }` in an enterprise app?
**Answer:** In recursive tree structures (like nested folder trees `<app-folder-item>` or threaded comment threads) where a child component needs to inject its parent component of the exact same class type. Without `skipSelf: true`, the component would inject itself and incorrectly calculate its depth as 0.

### Q7: What is the difference between `useClass` and `useExisting`?
**Answer:** `useClass` creates a **brand new instance** of the specified class. `useExisting` creates an **alias** pointing to an already instantiated singleton. If you want two separate token names to share the exact same state, always use `useExisting`.

### Q8: How do you prevent memory leaks in component-scoped services?
**Answer:** By using `takeUntilDestroyed()` or `inject(DestroyRef).onDestroy(() => { ... })`. This automatically tears down RxJS streams, intervals, and event listeners when the providing component unmounts, without requiring manual `ngOnDestroy()` methods.

### Q9: What is `InjectionToken` and when is it required?
**Answer:** `InjectionToken` is used when the dependency you are injecting does not have a runtime JavaScript class representation (e.g., TypeScript interfaces, primitive values, API URL strings, or configuration objects). Because TypeScript interfaces are stripped during compilation, an `InjectionToken<T>` provides a tangible runtime token for the Injector.

### Q10: What is the difference between ElementInjector and EnvironmentInjector?
**Answer:** `ElementInjector` is created implicitly at each DOM element (components, directives) and mirrors the DOM hierarchy. `EnvironmentInjector` is created at route boundaries, module boundaries, or root bootstrapping. Angular always checks the `ElementInjector` tree upwards first; if not found, it falls through to the `EnvironmentInjector` where the component was instantiated.

### Q11: What is `providedIn: 'platform'`?
**Answer:** It registers the service in the `PlatformInjector`, which sits above the root `EnvironmentInjector`. It is shared across multiple independent Angular applications running in the same browser window (useful for Microfrontend architectures).

### Q12: Can a service be injected into a directive or pipe?
**Answer:** Yes. Directives and pipes are fully integrated into Angular's DI system. Directives have their own `ElementInjector` node and can inject services provided at their own element or any ancestor element.

### Q13: What happens if a token is not provided anywhere and injected without `{ optional: true }`?
**Answer:** Angular traverses all the way to `NullInjector`, which throws a `NullInjectorError: No provider for Token!`.

### Q14: How does DI work with Angular Signals in modern architecture?
**Answer:** Services serve as the central reactive store. The service manages private writable signals (e.g. `_cartItems = signal<Item[]>([])`) and exposes public read-only projections via `items = this._cartItems.asReadonly()` and `computed()`. Components inject the service and read or trigger actions cleanly without RxJS subscription overhead.

### Q15: What is `multi: true` and where is it used in Angular?
**Answer:** `multi: true` tells Angular's DI that multiple providers can contribute to the same injection token as an array. Common examples include `HTTP_INTERCEPTORS`, `APP_INITIALIZER`, and custom plugin hook tokens.

### Q16: How do you mock services in Angular unit tests with modern standalone components?
**Answer:** By overriding component or application providers using `TestBed.configureTestingModule({ providers: [{ provide: AuthService, useValue: mockAuthService }] })` or `TestBed.overrideComponent(MyComponent, { set: { providers: [...] } })`.

---

## 12. 💻 Practical TypeScript Examples

Check out the fully annotated, runnable TypeScript examples in [`examples/`](./examples/):
- [`01-inject-function-vs-constructor.ts`](./examples/01-inject-function-vs-constructor.ts) - Modern `inject()` API vs legacy constructor injection.
- [`02-injector-hierarchy-resolution.ts`](./examples/02-injector-hierarchy-resolution.ts) - Resolution traversal across ElementInjector and EnvironmentInjector.
- [`03-service-scopes-and-providers.ts`](./examples/03-service-scopes-and-providers.ts) - Root, component, and route provider scopes.
- [`04-providers-vs-viewproviders.ts`](./examples/04-providers-vs-viewproviders.ts) - Content projection isolation with `viewProviders`.
- [`05-resolution-modifiers-self-host.ts`](./examples/05-resolution-modifiers-self-host.ts) - `optional`, `self`, `skipSelf`, and `host` modifiers.
- [`06-injection-tokens-and-factories.ts`](./examples/06-injection-tokens-and-factories.ts) - `InjectionToken`, `useFactory`, and `useValue`.
- [`07-signal-store-service-pattern.ts`](./examples/07-signal-store-service-pattern.ts) - Signal state store service pattern.
- [`08-functional-services-and-destroyref.ts`](./examples/08-functional-services-and-destroyref.ts) - Functional composables with `DestroyRef`.

---

## 13. 🎬 LinkedIn Animated GIFs & Visual Assets (Ready for Download & Upload)

Use these high-definition, prominent visual assets for LinkedIn technical carousels, YouTube Shorts, and architecture discussions:

### 1. 💉 Angular 22 Dependency Injection & Resolution Hierarchy
- **Visual Subject:** ElementInjector vs EnvironmentInjector traversal, `providedIn: 'root'` vs `providers` vs `viewProviders`, and resolution modifiers (`optional`, `self`, `skipSelf`, `host`).
- **Resolution:** 1080×1080 (Optimized for LinkedIn Feed) & 4K Ultra-HD (3840×3840)
- **Direct Asset Files:**
  - 🎬 **Animated GIF:** [`animations/angular-services-di-hierarchy.gif`](../animations/angular-services-di-hierarchy.gif)
  - 🌐 **Interactive Canvas:** [`animations/angular-services-di-hierarchy.html`](../animations/angular-services-di-hierarchy.html)
- **LinkedIn Caption Snippet:**
  > *"How Angular 22 resolves services under the hood! 🌲 The complete mental model of ElementInjector vs EnvironmentInjector trees, viewProviders isolation, and zero-boilerplate inject() API. #Angular #WebDevelopment #FrontendArchitecture #Angular22 #TypeScript"*

---

### 2. ⚡ Angular 22 Change Detection Pipeline & Zoneless Graph
- **Visual Subject:** Zoneless `provideZonelessChangeDetection()`, Signal push-pull dirty marking, microtask batching, and Ivy DOM paint.
- **Resolution:** 1080×1080 & 4K Ultra-HD
- **Direct Asset Files:**
  - 🎬 **Animated GIF:** [`animations/angular-change-detection-pipeline.gif`](../animations/angular-change-detection-pipeline.gif)
  - 🌐 **Interactive Canvas:** [`animations/angular-change-detection-pipeline.html`](../animations/angular-change-detection-pipeline.html)
- **LinkedIn Caption Snippet:**
  > *"Say goodbye to zone.js monkey patching! 🚀 Here is how Angular 22 coordinates $O(1)$ Signal reactivity with microtask DOM updates in pure Zoneless mode. #Angular #Signals #Zoneless #WebPerformance #Frontend #WebDevelopment"*

---

### 3. 🛡️ Angular 22 Functional Interceptor Pipeline & Silent 401 Refresh Mutex
- **Visual Subject:** `HttpInterceptorFn` chain, immutable request cloning, 401 interception, and silent JWT refresh replay mutex.
- **Resolution:** 1080×1080 & 4K Ultra-HD
- **Direct Asset Files:**
  - 🎬 **Animated GIF:** [`animations/angular-refresh-token-flow.gif`](../animations/angular-refresh-token-flow.gif)
  - 🌐 **Interactive Canvas:** [`animations/angular-refresh-token-flow.html`](../animations/angular-refresh-token-flow.html)
- **LinkedIn Caption Snippet:**
  > *"Enterprise JWT Authentication in Angular 22! 🛡️ Functional HTTP Interceptors + Silent 401 token refresh queue mutex explained visually. #Angular #TypeScript #JWT #Security #EnterpriseArchitecture #WebDevelopment"*
