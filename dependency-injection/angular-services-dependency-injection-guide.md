# Angular 22 Services & Dependency Injection Architecture Guide: Real-World Field Notes

> **Author:** Ashutosh Kumar Choubey  
> **Repository:** <a href="https://github.com/AshutoshChoubey/angular-interview-worldgyan.com" target="_blank" rel="noopener noreferrer">angular-interview-worldgyan.com</a>  
> **Course Module:** <a href="https://worldgyan.com/courses/angular-architecture/" target="_blank" rel="noopener noreferrer">worldgyan.com/courses/angular-architecture/</a>  
> **Architecture Animations:** [`animations/angular-services-di-hierarchy.html`](../animations/angular-services-di-hierarchy.html) · [`animations/angular-services-di-hierarchy.gif`](../animations/angular-services-di-hierarchy.gif)

---

## 1. Core Architectural Principle

> **Separation of Concerns (SoC) + Inversion of Control (IoC).**  
> UI Components should only care about user interactions and rendering state to the DOM. Heavy business logic, state synchronization, HTTP communication, and external API coordination belong in **Services**, orchestrated and delivered automatically by Angular's **Dependency Injection (DI)** engine.

---

## 2. ⚡ 60-Second Executive Cheat Sheet

| Architecture Concern | What Problem It Solves | Real-World Enterprise Scenario | Modern Angular 22 Syntax |
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

## 3. Real-World Problem: Why Do We Need Services?

### ❌ Anti-Pattern: Component Doing Everything
When components fetch their own data and manage tokens directly:
- **Code Duplication:** Header, Profile, and Cart copy-paste the same user fetching logic.
- **State Fragmentation:** Modifying the cart in one component does not reflect in the navbar.
- **Untestable UI:** Requires mocking global browser APIs (`fetch`, `localStorage`).

### ✅ Production Solution: Centralized Signal Store Service
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
  private readonly _items = signal<CartItem[]>([]);

  readonly items = this._items.asReadonly();
  readonly totalCount = computed(() => this._items().reduce((acc, i) => acc + i.quantity, 0));
  readonly totalPrice = computed(() => this._items().reduce((acc, i) => acc + i.price * i.quantity, 0));

  addItem(item: CartItem) {
    this._items.update(items => [...items, item]);
  }

  checkout() {
    return this.http.post('/api/checkout', { items: this._items() });
  }
}
```

---

## 4. Why Dependency Injection (DI)?

Manual `new Service()` instantiation tightly couples components to transitive dependencies, duplicates state, and prevents test mocking.

Angular DI inverts control: classes declare what they need, and Angular builds, configures, and shares singletons automatically.

```typescript
@Component({
  selector: 'app-checkout',
  standalone: true,
  template: `<p>Total: {{ cart.totalPrice() | currency }}</p>`
})
export class CheckoutComponent {
  protected cart = inject(CartService);
}
```

---

## 5. Modern `inject()` vs Constructor Injection

```typescript
// ❌ Legacy Constructor Injection (Verbose boilerplate, reflection metadata)
@Component({ ... })
export class OldCheckoutComponent {
  constructor(
    private cart: CartService,
    private auth: AuthService,
    @Optional() private analytics?: AnalyticsService
  ) {}
}

// ✅ Modern Angular 22 Functional Injection (Clean, composable, type-safe)
@Component({ ... })
export class ModernCheckoutComponent {
  private cart = inject(CartService);
  private auth = inject(AuthService);
  private analytics = inject(AnalyticsService, { optional: true });
}
```

### The Injection Context Rule:
`inject()` must run synchronously during construction. To inject inside deferred or asynchronous callbacks:
```typescript
export class DeferredComponent {
  private injector = inject(EnvironmentInjector);

  async handleAsync() {
    const { HeavyService } = await import('./heavy.service');
    runInInjectionContext(this.injector, () => {
      const heavy = inject(HeavyService);
      heavy.compute();
    });
  }
}
```

---

## 6. The 2 Hierarchical Injector Trees

```
[NullInjector] ➔ Throws NullInjectorError: No provider for Token!
      ▲
[PlatformInjector] ➔ Shared across multiple Angular apps on same page
      ▲
[Root EnvironmentInjector] ➔ providedIn: 'root' application-wide singletons
      ▲
====================== [Fall-through Boundary] ======================
      ▲
[Parent Component ElementInjector] ➔ Parent providers: [MyService]
      ▲
[Target Component ElementInjector] ➔ Target providers: [MyService]
```

Angular traverses the **ElementInjector** tree (DOM hierarchy) upwards first. If unresolved, it falls through to the **EnvironmentInjector** tree where the component was instantiated.

---

## 7. Resolution Modifiers in Real-World Scenarios

- `inject(AnalyticsService, { optional: true })`: Prevents crashes if telemetry is omitted.
- `inject(NgControl, { self: true })`: Validates control on current host DOM element only.
- `inject(FolderItemComponent, { optional: true, skipSelf: true })`: Recursive folder tree finds parent folder without injecting itself.
- `inject(HostService, { host: true })`: Bounds search to component template boundary.

---

## 8. Preventing Memory Leaks with `takeUntilDestroyed()`

```typescript
@Injectable() // Component-scoped
export class LiveOrderTrackerService {
  constructor() {
    interval(2000)
      .pipe(takeUntilDestroyed())
      .subscribe(tick => console.log('Order Ping:', tick));

    inject(DestroyRef).onDestroy(() => {
      console.log('Cleaned up WebSocket connection');
    });
  }
}
```

---

## 9. 🎬 LinkedIn Animated GIFs & Visual Assets

1. **💉 Angular 22 Dependency Injection Hierarchy:**
   - GIF: [`animations/angular-services-di-hierarchy.gif`](../animations/angular-services-di-hierarchy.gif)
   - Interactive Canvas: [`animations/angular-services-di-hierarchy.html`](../animations/angular-services-di-hierarchy.html)
2. **⚡ Angular 22 Zoneless Change Detection Pipeline:**
   - GIF: [`animations/angular-change-detection-pipeline.gif`](../animations/angular-change-detection-pipeline.gif)
   - Interactive Canvas: [`animations/angular-change-detection-pipeline.html`](../animations/angular-change-detection-pipeline.html)
3. **🛡️ Angular 22 Functional Interceptors & Silent 401 Refresh Mutex:**
   - GIF: [`animations/angular-refresh-token-flow.gif`](../animations/angular-refresh-token-flow.gif)
   - Interactive Canvas: [`animations/angular-refresh-token-flow.html`](../animations/angular-refresh-token-flow.html)
