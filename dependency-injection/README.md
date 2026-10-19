# Angular 22 Services & Dependency Injection Made Simple

> **💡 The Big Picture in 10 Seconds:**  
> A **Component** is like a **Waiter**: it only cares about what the customer sees on the screen (the HTML template).  
> A **Service** is like the **Kitchen Chef**: it handles the heavy business logic, fetches data from the API, and manages data behind the scenes.  
> **Dependency Injection (DI)** is the **Delivery System**: instead of the waiter cooking the food himself, Angular's DI system automatically delivers the ready-to-use Chef (Service) directly into the component whenever needed!

---

## 📑 Table of Contents
1. [⚡ 60-Second Plain English Cheat Sheet](#1--60-second-plain-english-cheat-sheet)
2. [🍳 What is a Service & Why Do We Need It?](#2--what-is-a-service--why-do-we-need-it)
3. [🚚 What is Dependency Injection (DI)?](#3--what-is-dependency-injection-di)
4. [💉 Modern `inject()` vs Constructor: Why `inject()` Won](#4--modern-inject-vs-constructor-why-inject-won)
5. [⏱️ The 1 Golden Rule: The Injection Context](#5--the-1-golden-rule-the-injection-context)
6. [🌲 How Angular Finds Services: The 2 Trees Made Easy](#6--how-angular-finds-services-the-2-trees-made-easy)
7. [📦 The 3 Main Service Scopes Explained](#7--the-3-main-service-scopes-explained)
8. [🔍 Resolution Modifiers in Everyday Words](#8--resolution-modifiers-in-everyday-words)
9. [🛠️ Provider Recipes: `useClass`, `useExisting`, `useValue`, `useFactory`](#9--provider-recipes-useclass-useexisting-usevalue-usefactory)
10. [🧹 Memory Leaks & Lifecycle Cleanup: `takeUntilDestroyed()`](#10--memory-leaks--lifecycle-cleanup-takeuntildestroyed)
11. [🎯 16 Real-World Interview Q&As (Plain English)](#11--16-real-world-interview-qas-plain-english)
12. [💻 Practical TypeScript Examples](#12--practical-typescript-examples)

---

## 1. ⚡ 60-Second Plain English Cheat Sheet

| Question / Concept | Simple Answer | Everyday Analogy |
| :--- | :--- | :--- |
| **What is a Service?** | A TypeScript class that holds business logic, API calls, and shared state outside components. | A kitchen chef who cooks the food so the waiter doesn't have to. |
| **What is Dependency Injection?** | Angular automatically creates and supplies service instances so you never call `new MyService()`. | Room service: you dial for coffee; someone brings it to your door ready to drink. |
| **`inject()` vs Constructor?** | Old: Clunky constructor parameters `constructor(private s: Svc)`.<br>New: Clean single line `private s = inject(Svc);`. | Old: Filling out a 5-page paper form.<br>New: 1-click checkout. |
| **`providedIn: 'root'`?** | ONE single instance shared across the entire application (Singleton). Tree-shakable. | The main building elevator: everyone in the building uses the exact same one. |
| **Component `providers: []`?** | A BRAND NEW instance created for this component and its children. Destroyed when component dies. | A private hotel room keycard: each guest gets their own unique one. |
| **Component `viewProviders: []`?** | A fresh instance for this component's own HTML, but **hidden** from projected `<ng-content>`. | Staff-only kitchen door: guests in the dining room can't see or touch what's inside. |
| **`inject(Svc, { optional: true })`?** | If Angular can't find the service, don't crash with an error; return `null`. | "Do you have ketchup? If not, no problem, I'll eat without it." |
| **`inject(Svc, { skipSelf: true })`?** | Don't look at my own component; look at my **parent** component! | "Ask my manager, don't ask me." (Essential for nested recursive components like folder trees). |
| **`inject(Svc, { self: true })`?** | Check ONLY this component or directive. If not here, stop immediately. | "Check my pocket only. Don't look anywhere else." |
| **`takeUntilDestroyed()`?** | Automatically unsubscribes RxJS subscriptions when the component or service dies. | An automatic sleep timer that turns off the TV when you leave the room. |

---

## 2. 🍳 What is a Service & Why Do We Need It?

### The Problem Without Services:
Imagine putting your HTTP calls, cart calculation, and user login logic directly inside your component:
- ❌ Your component file explodes into 1,000 lines of messy code.
- ❌ If 5 different pages need user profile data, you have to copy-paste the exact same code 5 times.
- ❌ It is almost impossible to write unit tests for your UI without making real API calls.

### The Solution:
Move all the data-handling logic into a **Service**:

```typescript
// src/app/core/user.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UserService {
  // A signal holding the logged-in user
  readonly currentUser = signal({ name: 'Ashutosh', role: 'Architect' });

  updateName(newName: string) {
    this.currentUser.update(u => ({ ...u, name: newName }));
  }
}
```

Now, any component in your application can easily access this data!

---

## 3. 🚚 What is Dependency Injection (DI)?

### The Old Manual Way (Without DI):
```typescript
// ❌ BAD: Component creates its own dependency
export class UserProfileComponent {
  private userService = new UserService(); // Tight coupling! Hard to test or share!
}
```
**Why this is bad:** If `UserService` later needs `HttpClient`, you would have to go into every single component and update `new UserService(http)`. A maintenance nightmare!

### The Angular DI Way (Automated Delivery):
You simply **ask** Angular for the service, and Angular creates it, manages it, and delivers it to you:

```typescript
// ✅ MODERN ANGULAR 22: Clean and simple!
import { Component, inject } from '@angular/core';
import { UserService } from './user.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  template: `<h2>Hello, {{ user.currentUser().name }}</h2>`
})
export class UserProfileComponent {
  // Angular automatically finds and gives you the UserService instance!
  protected user = inject(UserService);
}
```

---

## 4. 💉 Modern `inject()` vs Constructor: Why `inject()` Won

In older Angular code (before v14), everyone had to use constructor parameters:

```typescript
// 👴 Old Legacy Way (Constructor Injection)
@Component({ ... })
export class OldComponent {
  constructor(
    private userService: UserService,
    @Optional() private analytics: AnalyticsService,
    @Inject(API_URL) private apiUrl: string
  ) {}
}
```

In modern Angular 22, you use **`inject()`**:

```typescript
// 🚀 Modern Angular 22 Way (inject function)
@Component({ ... })
export class ModernComponent {
  private userService = inject(UserService);
  private analytics = inject(AnalyticsService, { optional: true });
  private apiUrl = inject(API_URL);
}
```

### Why Developers Love `inject()`:
1. **Less typing, no clutter:** No ugly constructor with 10 parameters.
2. **Type Inference:** TypeScript knows the type automatically without extra `@Inject()` decorators.
3. **No `super()` headaches in inheritance:** If a child class extends a parent class, you don't have to pass 8 arguments to `super(...)`!
4. **Reusable Functions:** You can write small, standalone helper functions (like custom hooks) that use `inject()` directly!

---

## 5. ⏱️ The 1 Golden Rule: The Injection Context

There is only **one rule** with `inject()`:  
> **You must call `inject()` while the class is being built** (in field initializers or inside the constructor).

```typescript
export class MyComponent {
  // ✅ ALLOWED: Field initializer
  private http = inject(HttpClient);

  constructor() {
    // ✅ ALLOWED: Inside constructor
    const auth = inject(AuthService);
  }

  ngOnInit() {
    // ❌ ERROR NG0203: Too late! Component is already built!
    // const router = inject(Router);
  }

  onClick() {
    // ❌ ERROR NG0203: Too late! Click happened long after creation!
    // const dialog = inject(DialogService);
  }
}
```

### What if I really need to inject something later inside a timeout or click?
Grab the **`Injector`** upfront during initialization, and use **`runInInjectionContext`**:

```typescript
export class MyComponent {
  private injector = inject(Injector); // 1. Save injector when building

  onDelayedAction() {
    setTimeout(() => {
      // 2. Safely run code inside the injection context later!
      runInInjectionContext(this.injector, () => {
        const http = inject(HttpClient);
        http.get('/api/log').subscribe();
      });
    }, 1000);
  }
}
```

---

## 6. 🌲 How Angular Finds Services: The 2 Trees Made Easy

Imagine you are at your office desk and you need a stapler. How do you find one?
1. First, you check your own desk (**Your Component**).
2. If you don't have one, you ask your desk neighbor or team lead (**Parent Component**).
3. If they don't have one, you walk up to the company stationery cabinet (**App Root**).
4. If the company cabinet is empty, you get an error: *"No stapler found!"* (unless you said: *"If not available, no worries"*).

Angular does the **exact same thing** using two trees:

```
[NullInjector] ➔ Throws "No provider found" (unless optional: true)
      ▲
[PlatformInjector] ➔ Shared across multiple Angular apps on same page
      ▲
[Root EnvironmentInjector] ➔ providedIn: 'root' (App-wide singletons)
      ▲
====================== [Fall-through Boundary] ======================
      ▲
[Parent Component ElementInjector] ➔ Parent providers: [MyService]
      ▲
[Your Component ElementInjector] ➔ Your providers: [MyService]
```

### The 2 Trees:
1. **ElementInjector Tree:** Follows your HTML template layout (Child component $\to$ Parent component $\to$ Root `<app-root>`).
2. **EnvironmentInjector Tree:** Follows the application boot structure (Route $\to$ App Root $\to$ Platform $\to$ Null).

Angular always checks the **Element Tree** first. If not found, it falls back to the **Environment Tree**!

---

## 7. 📦 The 3 Main Service Scopes Explained

### 1. `providedIn: 'root'` (Global Singleton)
```typescript
@Injectable({ providedIn: 'root' })
export class AuthService { ... }
```
- **What it means:** There is only **ONE** instance for the entire app.
- **When to use:** For 90% of services! User login, shopping cart, theme state, API services.
- **Superpower:** **Tree-shakable!** If you create this service but never import or use it, Angular completely removes it from the final production bundle.

---

### 2. Component `providers: [MyService]` (Private Copy for this Component)
```typescript
@Component({
  selector: 'app-ticket-editor',
  standalone: true,
  providers: [ TicketDraftService ], // 👈 Creates a fresh instance!
  template: `...`
})
export class TicketEditorComponent { ... }
```
- **What it means:** Every time `<app-ticket-editor>` appears on the screen, Angular creates a **brand-new instance** of `TicketDraftService`.
- **When to use:** When you have local component state that should disappear when the component is closed (e.g. an unsaved form draft, a video player controller).
- **Bonus:** Any child components inside `<app-ticket-editor>` share this same draft!

---

### 3. Component `viewProviders: [MyService]` (Staff-Only Secret)
```typescript
@Component({
  selector: 'app-custom-card',
  standalone: true,
  viewProviders: [ CardPrivateStateService ], // 👈 Hidden from <ng-content>!
  template: `
    <div class="card-inner">
      <ng-content></ng-content> <!-- The user puts content here -->
    </div>
  `
})
export class CustomCardComponent { ... }
```
- **What it means:** A fresh instance for this component, BUT **hidden from content projected through `<ng-content>`**.
- **Analogy:**  
  - `providers`: A water cooler in the lobby—both staff and guests can drink from it.  
  - `viewProviders`: The staff-only breakroom—guests in the lobby cannot see or touch it!
- **When to use:** When building reusable UI component libraries (accordions, tabs, dropdowns) where you don't want the user's projected HTML to accidentally touch or break your internal state.

---

## 8. 🔍 Resolution Modifiers in Everyday Words

Sometimes you don't want Angular to use the default search path. You can pass simple options to `inject()`:

### 1. `{ optional: true }` — "Don't crash if missing"
```typescript
// If LoggerService is not provided anywhere, logger will just be null instead of crashing!
const logger = inject(LoggerService, { optional: true });
logger?.log('Hello');
```

---

### 2. `{ self: true }` — "Look ONLY on my own element"
```typescript
// Only check if THIS exact component/directive provides it. Don't look at parents!
const ctrl = inject(NgControl, { self: true });
```

---

### 3. `{ skipSelf: true }` — "Ask my parent, NOT me"
Imagine a folder tree where a folder wants to know its parent folder. If it looks at itself, it gets confused. It must skip itself and ask the parent!

```typescript
@Component({
  selector: 'app-folder-node',
  standalone: true,
  template: `<div>Folder depth: {{ depth }}</div><ng-content></ng-content>`
})
export class FolderNodeComponent {
  // Skip myself, look at the parent folder node!
  private parent = inject(FolderNodeComponent, { optional: true, skipSelf: true });

  readonly depth: number = this.parent ? this.parent.depth + 1 : 0;
}
```

---

### 4. `{ host: true }` — "Stop at the host component boundary"
Directives use this when they want to search up to their host component, but not leak into the outer outside world.

---

## 9. 🛠️ Provider Recipes: `useClass`, `useExisting`, `useValue`, `useFactory`

| Provider Syntax | What It Does | Common Real-World Use Case |
| :--- | :--- | :--- |
| `{ provide: Logger, useClass: BetterLogger }` | Replaces `Logger` with a brand-new instance of `BetterLogger`. | Swapping a fake mock logger in unit tests. |
| `{ provide: OldService, useExisting: NewService }` | Aliases `OldService` to the **exact same singleton** as `NewService`. | Refactoring legacy APIs without breaking older components. |
| `{ provide: API_URL, useValue: 'https://api.worldgyan.com' }` | Injects a static value, string, or configuration object. | App configurations, feature flags, environment URLs. |
| `{ provide: API_CLIENT, useFactory: () => buildClient() }` | Runs a dynamic function to compute and return the dependency. | Initializing third-party SDKs requiring runtime conditions. |
| `{ provide: HTTP_INTERCEPTORS, useClass: Auth, multi: true }` | Allows multiple providers under one token (returns an array). | Interceptor pipelines, app initializer arrays. |

---

## 10. 🧹 Memory Leaks & Lifecycle Cleanup: `takeUntilDestroyed()`

### The Common Mistake:
If a component-scoped service starts an interval timer or subscribes to an RxJS stream and you don't cancel it, that timer keeps running in the background forever even after the component is deleted from the screen! This is a **memory leak**.

### The Modern Angular 22 Fix: `takeUntilDestroyed()`
You don't need `ngOnDestroy()` anymore! Just add `.pipe(takeUntilDestroyed())`:

```typescript
import { Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';

@Injectable()
export class StockTickerService {
  constructor() {
    interval(1000)
      .pipe(takeUntilDestroyed()) // 👈 Automatically stops when component dies!
      .subscribe(tick => console.log('Tick:', tick));
  }
}
```

Or register custom teardown with **`DestroyRef`**:
```typescript
import { inject, DestroyRef } from '@angular/core';

export function useWindowResize() {
  const onResize = () => console.log(window.innerWidth);
  window.addEventListener('resize', onResize);

  // Automatically clean up when whoever called this function gets destroyed!
  inject(DestroyRef).onDestroy(() => {
    window.removeEventListener('resize', onResize);
  });
}
```

---

## 11. 🎯 16 Real-World Interview Q&As (Plain English)

### Q1: What is Dependency Injection in simple terms?
**Answer:** DI is a design pattern where a class receives its dependencies from an external source (Angular) rather than creating them itself via `new MyService()`. This decouples classes, makes testing effortless via mocks, and centralizes instance lifecycle management.

### Q2: What is the benefit of `inject()` over constructor injection?
**Answer:** `inject()` removes constructor boilerplate, enables clean TypeScript generic type inference without `@Inject()`, makes class inheritance simple (no need to forward dependencies to `super()`), and allows creating reusable functional primitives (like custom hooks).

### Q3: What is the difference between `providers` and `viewProviders`?
**Answer:** Both create an instance for the component. However, `providers` is visible to both the component's own template **and** projected content inside `<ng-content>`. `viewProviders` is visible **only** to the component's own template, hiding the service from projected content.

### Q4: What does `providedIn: 'root'` do under the hood?
**Answer:** It registers the service with the `RootEnvironmentInjector` as an application-wide singleton. It is also **tree-shakable**: if no component or code references the service, the bundler excludes it from the production JavaScript bundle.

### Q5: When does error `NG0203` occur?
**Answer:** It occurs when `inject()` is called outside an active **Injection Context** (for example, inside `ngOnInit()`, inside a `setTimeout()`, or in an event handler). To fix it, call `inject()` during field initialization, or wrap asynchronous code in `runInInjectionContext(this.injector, () => { ... })`.

### Q6: Why does `{ skipSelf: true }` matter in tree structures?
**Answer:** In nested recursive components (like a folder tree `<app-folder-node>`), each folder wants to find its parent folder. Without `skipSelf: true`, the folder would inject itself and think its depth is 0. `skipSelf: true` skips the current component and looks up at the parent!

### Q7: What is the difference between `useClass` and `useExisting`?
**Answer:** `useClass` creates a **brand-new instance** of the target class. `useExisting` creates an **alias** pointing to an already-existing instance. If you want two tokens to share the exact same singleton instance, you must use `useExisting`.

### Q8: How does modern Angular handle service teardown?
**Answer:** Via `DestroyRef`. Calling `inject(DestroyRef).onDestroy(() => cleanup())` or using `.pipe(takeUntilDestroyed())` allows services and functions to register their own cleanup without needing to implement `ngOnDestroy()`.

### Q9: What is `providedIn: 'platform'`?
**Answer:** It registers the service in the `PlatformInjector`. This single instance is shared across **multiple Angular applications** running in the same browser window (e.g. Microfrontends sharing a global auth or logging bus).

### Q10: How do you inject a service inside a functional route guard?
**Answer:** Since functional route guards execute inside an injection context, you simply call `const auth = inject(AuthService);` directly in the guard function!

### Q11: What is an `InjectionToken` and when should you use one?
**Answer:** An `InjectionToken` is an object used to inject non-class dependencies, such as primitives, interface types, API URLs, or configuration objects where no JavaScript class constructor exists.

### Q12: What is the `NullInjector`?
**Answer:** The `NullInjector` is the top-most sentinel injector in the hierarchy. If a dependency cannot be found anywhere in the tree, the `NullInjector` throws the familiar `NullInjectorError: No provider for X!` unless `{ optional: true }` was specified.

### Q13: Can a service inject another service?
**Answer:** Yes! As long as the injected service is in the same injector or an ancestor injector, any service can call `inject(OtherService)`. Circular dependencies must be avoided.

### Q14: How does tree-shaking work with Angular services?
**Answer:** When a service uses `@Injectable({ providedIn: 'root' })`, the service points to the module, not vice versa. If no imported code references the token, JavaScript bundlers (esbuild / Webpack) strip the class entirely from the production bundle.

### Q15: What is the difference between `@Self()` and `@Host()`?
**Answer:** `@Self()` looks only on the current element. `@Host()` starts on the current element and walks up until it hits the host component that rendered the template, preventing dependencies from leaking into the parent application.

### Q16: How do you unit test a component that uses `inject()`?
**Answer:** In `TestBed.configureTestingModule()`, override the service provider using `{ provide: MyService, useValue: mockService }`. When the component calls `inject(MyService)`, Angular injects the mock automatically!

---

## 12. 💻 Practical TypeScript Examples

Explore the complete, production-grade example files in this directory:

- [`01-inject-function-vs-constructor.ts`](./examples/01-inject-function-vs-constructor.ts) — Field injection, injection context & async handling.
- [`02-injector-hierarchy-resolution.ts`](./examples/02-injector-hierarchy-resolution.ts) — ElementInjector vs EnvironmentInjector lookup path.
- [`03-service-scopes-and-providers.ts`](./examples/03-service-scopes-and-providers.ts) — Root, platform, and component-scoped services.
- [`04-providers-vs-viewproviders.ts`](./examples/04-providers-vs-viewproviders.ts) — Protecting component internals from `<ng-content>`.
- [`05-resolution-modifiers-self-host.ts`](./examples/05-resolution-modifiers-self-host.ts) — `optional`, `self`, `skipSelf`, and `host` in action.
- [`06-injection-tokens-and-factories.ts`](./examples/06-injection-tokens-and-factories.ts) — InjectionTokens, `useFactory`, and multi-providers.
- [`07-signal-store-service-pattern.ts`](./examples/07-signal-store-service-pattern.ts) — Lightweight reactive Signal Store service.
- [`08-functional-services-and-destroyref.ts`](./examples/08-functional-services-and-destroyref.ts) — Composable functions & automated memory cleanup.
