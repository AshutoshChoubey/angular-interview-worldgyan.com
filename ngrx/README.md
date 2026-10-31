# NgRx State Management & Enterprise Reactivity

A comprehensive architectural breakdown of **NgRx 19+**, reactive side-effect orchestration with `@ngrx/effects`, memoized selectors, Signal-Store interop via `store.selectSignal()`, and Cloudflare Pages SPA deployment patterns.

---

## 📑 Table of Contents
1. [Core Redux Primitives in Angular](#1-core-redux-primitives-in-angular)
2. [Actions & Strongly Typed Payloads (`createAction`)](#2-actions--strongly-typed-payloads-createaction)
3. [Pure Reducers & Immutability (`createReducer`)](#3-pure-reducers--immutability-createreducer)
4. [Side-Effect Orchestration (`createEffect`)](#4-side-effect-orchestration-createeffect)
5. [Deep Dive: `ofType` and `switchMap`](#5-deep-dive-oftype-and-switchmap)
6. [Memoized Selectors (`createSelector`)](#6-memoized-selectors-createselector)
7. [Signal-Store Bridge (`store.selectSignal`)](#7-signal-store-bridge-storeselectsignal)
8. [Cloudflare Pages SPA Deployment & Fallbacks](#8-cloudflare-pages-spa-deployment--fallbacks)
9. [Senior/Principal Interview Q&A](#9-seniorprincipal-interview-qa)

---

## 1. Core Redux Primitives in Angular

NgRx implements the Redux pattern tailored to Angular's reactive ecosystem:
- **Single Source of Truth:** Global application state is stored in an immutable state tree inside the Store.
- **State is Read-Only:** The only way to change the state is by dispatching an explicit Action.
- **Changes via Pure Functions:** Reducers calculate the next state `(state, action) => newState` with zero side effects.
- **Isolated Side-Effects:** All asynchronous operations (HTTP calls, storage synchronization, timers) are isolated in Effects.

```
       ┌─────────────────────────┐
       │     UI Component        │
       └────────────┬────────────┘
                    │ 1. dispatch(Action)
                    ▼
       ┌─────────────────────────┐         2. Intercepts async
       │      NgRx Store         │──────────────────────────────┐
       └────────────┬────────────┘                              │
                    │                                           ▼
                    │ 3. Computes pure state       ┌─────────────────────────┐
                    ▼                              │      NgRx Effects       │
       ┌─────────────────────────┐                 └────────────┬────────────┘
       │         Reducer         │                              │ 4. Calls API
       └────────────┬────────────┘                              ▼
                    │                              ┌─────────────────────────┐
                    │ 5. New State                 │       Backend API       │
                    ▼                              └─────────────────────────┘
       ┌─────────────────────────┐                              │
       │   Memoized Selectors    │◀─────────────────────────────┘
       │ (store.selectSignal())  │   Emits Success/Failure Action
       └────────────┬────────────┘
                    │ 6. Fine-grained reactivity
                    ▼
       ┌─────────────────────────┐
       │   Component Template    │
       └─────────────────────────┘
```

---

## 2. Actions & Strongly Typed Payloads (`createAction`)

Actions express unique events originating from user interactions, network responses, or lifecycle hooks:

```typescript
import { createAction, props } from '@ngrx/store';
import { Character, CharacterApiResponse } from './character.model';

export const loadCharacters = createAction(
  '[Characters] Load Characters',
  props<{ page: number; name?: string }>()
);

export const loadCharactersSuccess = createAction(
  '[Characters] Load Characters Success',
  props<{ response: CharacterApiResponse }>()
);

export const loadCharactersFailure = createAction(
  '[Characters] Load Characters Failure',
  props<{ error: string }>()
);
```

- **Namespaced Type Strings:** `[Source] Event` convention prevents action collisions.
- **Payload Safety:** `props<T>()` guarantees compile-time validation on dispatched arguments.

---

## 3. Pure Reducers & Immutability (`createReducer`)

Reducers are synchronous, deterministic functions. They never mutate existing state:

```typescript
import { createReducer, on } from '@ngrx/store';
import * as CharacterActions from './characters.actions';

export interface CharactersState {
  characters: Character[];
  totalCharacters: number;
  loading: boolean;
  error: string | null;
}

export const initialCharactersState: CharactersState = {
  characters: [],
  totalCharacters: 0,
  loading: true,
  error: null
};

export const charactersReducer = createReducer(
  initialCharactersState,

  on(CharacterActions.loadCharacters, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(CharacterActions.loadCharactersSuccess, (state, { response }) => ({
    ...state,
    characters: response.results || [],
    totalCharacters: response.info?.count || 0,
    loading: false,
    error: null
  })),

  on(CharacterActions.loadCharactersFailure, (state, { error }) => ({
    ...state,
    characters: [],
    totalCharacters: 0,
    loading: false,
    error
  }))
);
```

---

## 4. Side-Effect Orchestration (`createEffect`)

Effects listen to the action stream, perform asynchronous operations (such as HTTP requests), and dispatch outcome actions:

```typescript
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { switchMap, map, catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { RickAndMortyService } from './rick-and-morty.service';
import * as CharacterActions from './characters.actions';

@Injectable()
export class CharactersEffects {
  private readonly actions$ = inject(Actions);
  private readonly apiService = inject(RickAndMortyService);

  loadCharacters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CharacterActions.loadCharacters),
      switchMap(({ page, name }) =>
        this.apiService.getCharacters(page, name).pipe(
          map((response) => CharacterActions.loadCharactersSuccess({ response })),
          catchError(() =>
            of(
              CharacterActions.loadCharactersFailure({
                error: 'Failed to load characters. Please check network connection.'
              })
            )
          )
        )
      )
    )
  );

  searchCharacters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CharacterActions.setSearchQuery),
      debounceTime(350),
      distinctUntilChanged((prev, curr) => prev.query === curr.query),
      map(({ query }) => CharacterActions.loadCharacters({ page: 1, name: query }))
    )
  );
}
```

---

## 5. Deep Dive: `ofType` and `switchMap`

### What is `ofType`?
`ofType` is an RxJS filtering operator provided by `@ngrx/effects`. The global `actions$` stream emits every action dispatched anywhere across the entire application. `ofType` filters this continuous stream to allow only specific action creator instances to pass downstream:

```typescript
this.actions$.pipe(
  ofType(CharacterActions.loadCharacters) // Filters out all other actions
)
```

### Why `switchMap`?
`switchMap` is critical for concurrency control in search and pagination:
1. When a source action arrives, `switchMap` subscribes to the inner HTTP Observable.
2. If a **new action arrives before the previous HTTP response has completed**, `switchMap` **immediately cancels and aborts the in-flight HTTP request**.
3. **Race Condition Prevention:** If a user types "R", "Ri", "Rick", `switchMap` ensures that stale responses from earlier queries are aborted, guaranteeing that only the latest query result renders in the UI.

---

## 6. Memoized Selectors (`createSelector`)

Selectors query and slice specific state fragments while memoizing computed values:

```typescript
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CharactersState } from './characters.reducer';

export const selectCharactersState =
  createFeatureSelector<CharactersState>('characters');

export const selectAllCharacters = createSelector(
  selectCharactersState,
  (state) => state.characters
);

export const selectCharactersLoading = createSelector(
  selectCharactersState,
  (state) => state.loading
);
```

- **Memoization:** If the input slices have not changed (by reference equality), the selector returns the cached result without re-executing the projector function.

---

## 7. Signal-Store Bridge (`store.selectSignal`)

In Angular 16 – 22+, `store.selectSignal()` converts memoized selectors directly into native Angular Signals:

```typescript
@Component({
  selector: 'app-character-list',
  standalone: true,
  template: `
    @if (loading()) {
      <app-spinner />
    } @else {
      @for (char of characters(); track char.id) {
        <app-card [character]="char" />
      }
    }
  `
})
export class CharacterListComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly subscriptions = new Subscription();

  // Fine-grained Signal bindings
  readonly characters = this.store.selectSignal(selectAllCharacters);
  readonly loading = this.store.selectSignal(selectCharactersLoading);

  ngOnInit(): void {
    this.store.dispatch(CharacterActions.loadCharacters({ page: 1 }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
```

---

## 8. Cloudflare Pages SPA Deployment & Fallbacks

When deploying Angular SPAs to Cloudflare Pages:
1. **Never use `/* /index.html 200` in `_redirects`:** Wrangler flags code `100324` (Infinite loop detected) because Cloudflare automatically strips `.html` extensions.
2. **Native SPA Fallback:** Cloudflare Pages automatically serves `index.html` with HTTP 200 for all client-side routes if no `404.html` exists in the publish directory.
3. **Static Fallback Copy (`200.html`):** Add a post-build script copying `index.html` to `200.html`:
   ```json
   "build": "ng build && node -e \"const fs=require('fs'); if(fs.existsSync('dist/browser/index.html')) fs.copyFileSync('dist/browser/index.html', 'dist/browser/200.html');\""
   ```

---

## 9. Senior/Principal Interview Q&A

### Q1: Why use NgRx over Component-Level Signals?
> **Answer:** Component signals are ideal for local view state (e.g., dropdown open/close, accordion toggles). However, for enterprise applications with multi-step workflows, cross-feature state sharing, role-based route guards, and audit requirements, NgRx provides a strictly deterministic, unidirectional state machine with time-travel debugging, side-effect isolation, and replayable telemetry.

### Q2: What happens if you use `mergeMap` instead of `switchMap` in search effects?
> **Answer:** `mergeMap` executes all inner Observables concurrently without cancelling prior in-flight requests. If query "R" takes 800ms and query "Rick" takes 150ms, "Rick" will render first, followed by "R" overwriting it with stale results. `switchMap` guarantees cancellation of stale requests.

### Q3: When should `concatMap` or `exhaustMap` be used in NgRx?
> **Answer:**
> - `concatMap`: Queues requests sequentially (e.g., batch uploads or transactional payments where ordering is mandatory).
> - `exhaustMap`: Ignores new incoming actions until the current request completes (e.g., login buttons or form submission to prevent double-click duplicate payments).
