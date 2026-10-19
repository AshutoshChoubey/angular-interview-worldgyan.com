# Angular 22 Services & Dependency Injection Architecture Guide

> **Author:** Ashutosh Kumar Choubey  
> **Repository:** [angular-interview-worldgyan.com](https://github.com/AshutoshChoubey/angular-interview-worldgyan.com)  
> **Course Module:** [worldgyan.com/courses/angular-architecture/](https://worldgyan.com/courses/angular-architecture/)  
> **Animation:** [`animations/angular-services-di-hierarchy.html`](../animations/angular-services-di-hierarchy.html) · [`animations/angular-services-di-hierarchy.gif`](../animations/angular-services-di-hierarchy.gif)

---

## 1. The Big Picture in 10 Seconds

> A **Component** is like a **Waiter**: it only cares about what the customer sees on the screen (the HTML template).  
> A **Service** is like the **Kitchen Chef**: it handles the heavy business logic, fetches data from the API, and manages data behind the scenes.  
> **Dependency Injection (DI)** is the **Delivery System**: instead of the waiter cooking the food himself, Angular's DI system automatically delivers the ready-to-use Chef (Service) directly into the component whenever needed!

---

## 2. ⚡ 60-Second Plain English Cheat Sheet

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

## 3. Why Do We Need Services?

### Without Services:
Putting HTTP calls and state directly in components creates:
- ❌ Massive, unmaintainable components (1,000+ lines).
- ❌ Code duplication across pages.
- ❌ Difficult unit testing without real network calls.

### With Services:
Move business logic to a `@Injectable()` service and access it anywhere cleanly via `inject(MyService)`:

```typescript
@Injectable({ providedIn: 'root' })
export class UserService {
  readonly currentUser = signal({ name: 'Ashutosh', role: 'Architect' });

  updateName(newName: string) {
    this.currentUser.update(u => ({ ...u, name: newName }));
  }
}
```

---

## 4. Modern `inject()` vs Constructor Injection

```typescript
// ❌ Legacy Constructor Injection (Verbose & boilerplated)
@Component({ ... })
export class OldComponent {
  constructor(
    private userService: UserService,
    @Optional() private analytics: AnalyticsService,
    @Inject(API_URL) private apiUrl: string
  ) {}
}

// ✅ Modern Angular 22 Functional Injection (Clean, composable, type-safe)
@Component({ ... })
export class ModernComponent {
  private userService = inject(UserService);
  private analytics = inject(AnalyticsService, { optional: true });
  private apiUrl = inject(API_URL);
}
```

### Advantages of `inject()`:
1. **Zero Constructor Clutter:** Declarations stay neat and concise.
2. **Effortless Inheritance:** No need to pass dependencies up `super(...)`.
3. **Composable Functional Helpers:** Write custom functional utilities that inject dependencies directly.

---

## 5. The Golden Rule: The Injection Context

`inject()` only works during **creation time**:
- In field initializers (`private s = inject(Svc);`)
- Inside constructors (`constructor() { const s = inject(Svc); }`)

Calling `inject()` inside `ngOnInit()`, event listeners, or asynchronous callbacks throws **`NG0203`**.

To inject inside an asynchronous callback later:
```typescript
export class MyComponent {
  private injector = inject(Injector); // Capture injector at construction time

  onDelayedAction() {
    setTimeout(() => {
      runInInjectionContext(this.injector, () => {
        const http = inject(HttpClient);
        http.get('/api/log').subscribe();
      });
    }, 1000);
  }
}
```

---

## 6. How Angular Finds Services: The 2 Trees

Think of searching for a stapler in an office:
1. Check your own desk (**ElementInjector**).
2. Check your manager's desk (**Parent ElementInjector**).
3. Check the office stationery cabinet (**Root EnvironmentInjector**).
4. If still missing, throw an error unless `{ optional: true }`.

```
[NullInjector] (Throws error unless optional: true)
      ▲
[PlatformInjector] (Shared across multiple apps on the same page)
      ▲
[Root EnvironmentInjector] (providedIn: 'root' singletons)
      ▲
====================== [Fall-through Boundary] ======================
      ▲
[Parent Component ElementInjector]
      ▲
[Current Component ElementInjector]
```

---

## 7. The 3 Main Scopes

1. **`providedIn: 'root'`**: Single app-wide instance. Tree-shakable: excluded from bundle if never used.
2. **Component `providers: [Svc]`**: Fresh instance created for this component and its children. Destroyed with component.
3. **Component `viewProviders: [Svc]`**: Fresh instance strictly for this component's template; hidden from projected `<ng-content>`.

---

## 8. Resolution Modifiers

- `{ optional: true }`: Returns `null` if not found instead of crashing.
- `{ self: true }`: Searches only the current element.
- `{ skipSelf: true }`: Skips current element and starts search on the parent.
- `{ host: true }`: Limits search to the template host boundary.

---

## 9. Memory Leaks & Lifecycle Cleanup

Prevent lingering subscriptions with `takeUntilDestroyed()` or `DestroyRef`:

```typescript
@Injectable()
export class LiveFeedService {
  constructor() {
    interval(1000)
      .pipe(takeUntilDestroyed())
      .subscribe(tick => console.log('Tick:', tick));
  }
}
```

---

## 10. Key Interview Takeaways

1. **`inject()` over constructor:** Eliminates decorator metadata, simplifies inheritance, enables composability.
2. **`providers` vs `viewProviders`:** `providers` is visible to `<ng-content>`; `viewProviders` hides the token from projected children.
3. **`useClass` vs `useExisting`:** `useClass` creates a new instance; `useExisting` creates an alias to an existing singleton.
4. **`skipSelf` in trees:** Essential for recursive components (like folder trees) so children inspect parent instances rather than themselves.
5. **`DestroyRef`:** Enables teardown registration in services and composable functions without implementing `ngOnDestroy`.
