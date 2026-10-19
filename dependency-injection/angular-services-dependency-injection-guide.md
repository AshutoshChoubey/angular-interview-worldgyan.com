# Angular 22 Services & Dependency Injection Architecture Guide

> **Author:** Ashutosh Kumar Choubey  
> **Repository:** [angular-interview-worldgyan.com](https://github.com/AshutoshChoubey/angular-interview-worldgyan.com)  
> **Course Module:** [worldgyan.com/courses/angular-architecture/](https://worldgyan.com/courses/angular-architecture/)  
> **Animation:** [`animations/angular-services-di-hierarchy.html`](../animations/angular-services-di-hierarchy.html) · [`animations/angular-services-di-hierarchy.gif`](../animations/angular-services-di-hierarchy.gif)

---

## 1. Executive Summary

Dependency Injection (DI) is the architectural spine of Angular. In Angular 22, the framework has completed its paradigm shift from legacy constructor-based parameter reflection to the lightweight, composable, functional **`inject()` API**. Angular resolves dependencies through **two distinct parallel trees**: the **ElementInjector Tree** (tied to DOM component hierarchy and view encapsulation) and the **EnvironmentInjector Tree** (tied to application bootstrapping, platform contexts, and routed chunks).

---

## 2. 60-Second Executive Cheat Sheet

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

## 3. The 8 Types of Services & Provider Scopes

1. **Root Singleton Service (`providedIn: 'root'`)**: Eager or lazy singleton shared across the entire SPA; tree-shakable if unreferenced.
2. **Platform Singleton Service (`providedIn: 'platform'`)**: Shared across multiple Angular applications mounted inside the same DOM window.
3. **Transient Scoped Service (`providedIn: 'any'`)**: Distinct instance instantiated per lazy route boundary.
4. **Component-Scoped Service (`providers: [Service]`)**: Tied to component lifecycle; visible to template and `<ng-content>`.
5. **View-Isolated Service (`viewProviders: [Service]`)**: Hidden from projected `<ng-content>`; protects component internals from collision.
6. **Functional Composable Services**: Standalone composable functions leveraging `inject()`.
7. **InjectionToken Services**: Type-safe tokens with self-providing factories.
8. **Signal State Stores**: State management services exposing read-only signals and fine-grained computed projections.

---

## 4. 16 Senior & Principal Architect Interview Q&As

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

### Q8: What does { host: true } do and how does it relate to ViewEncapsulation?
**Answer:** `{ host: true }` restricts injector traversal to stop at the "host" component of the requesting directive or component. For directives applied directly to an element inside a component template, the traversal will search the directive's element and up to the host component's ElementInjector, but **will not penetrate outer parent components**.

### Q9: Why is new InjectionToken<T>('...', { factory: () => ... }) considered tree-shakable?
**Answer:** When an `InjectionToken` declares a `factory` property, it is **self-providing**: Angular compiles it with a `ɵprov` definition. If no component or service imports that token, bundlers (esbuild) identify the token as dead code and completely eliminate both the token and its factory implementation from the final production bundle.

### Q10: How do you handle circular dependency between two services in Angular?
**Answer:** Extract the shared concern into an independent third service, or use reactive Signals/Events. If refactoring is impossible, resolve the circular dependency lazily using `inject(Injector)` and calling `this.injector.get(OtherService)` at runtime.

### Q11: What is the role of DestroyRef in modern Angular services?
**Answer:** `DestroyRef` allows any service, factory, or standalone function executing within an injection context to register teardown callbacks via `inject(DestroyRef).onDestroy(() => { ... })`. This powers modern RxJS interop operators like `takeUntilDestroyed()` and enables automatic cleanup of WebSocket connections, timers, and browser event listeners when component-scoped services unmount.

### Q12: How do multi-providers (multi: true) work under the hood?
**Answer:** When `{ provide: TOKEN, useValue: X, multi: true }` is used, Angular's injector creates an internal array for that token. Each subsequent provider registered with `multi: true` appends its resolved value to this array. Calling `inject(TOKEN)` returns `T[]` containing all registered instances in the order they were provided.

### Q13: Can you inject an ElementRef or ViewContainerRef inside a root singleton service? Why or why not?
**Answer:** **No.** `ElementRef` and `ViewContainerRef` belong strictly to the **ElementInjector Tree** because they represent specific nodes in the browser DOM. A root singleton service resides in the `RootEnvironmentInjector`, which sits above all DOM elements. Attempting to inject `ElementRef` into a `providedIn: 'root'` service will throw `NG0201: No provider found for ElementRef`.

### Q14: How does Angular 22's Zoneless mode impact Dependency Injection?
**Answer:** Zoneless change detection does not alter the hierarchical injector resolution algorithm. However, services can no longer rely on Zone.js to detect mutations made inside unpatched async callbacks. Services in Zoneless applications must expose state via **Angular Signals** (`signal()`, `computed()`) so the runtime scheduler can track fine-grained dirty dependencies in $O(1)$ time.

### Q15: How do you test a service that relies on inject() without bootstrapping a component?
**Answer:** Use `TestBed.runInInjectionContext()` or `TestBed.inject()`:
```typescript
TestBed.configureTestingModule({
  providers: [UserProfileService, { provide: HttpClient, useValue: mockHttp }]
});
const service = TestBed.inject(UserProfileService);
```

### Q16: What is the "Lightweight Token" pattern and what optimization does it provide?
**Answer:** The Lightweight Token pattern defines an abstract class token without implementation:
```typescript
export abstract class TabGroupToken {
  abstract activeTabId: Signal<string>;
}
```
Child components (`<app-tab-item>`) inject `TabGroupToken` instead of importing the concrete `TabGroupComponent` class. This allows the bundler to tree-shake unused component implementation code and avoid circular import cycles.
