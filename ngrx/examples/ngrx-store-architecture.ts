/**
 * Production-Grade NgRx Store Architecture & Signal-Store Interoperability
 * 
 * Demonstrates:
 * 1. Strongly typed action creators (createAction, props)
 * 2. Immutable state reducer (createReducer, on)
 * 3. Side-effect pipeline (createEffect, ofType, switchMap, debounceTime, catchError)
 * 4. Memoized selectors (createFeatureSelector, createSelector)
 * 5. Standalone Angular Component with store.selectSignal() & OnDestroy teardown
 */

import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Subscription, of, Observable } from 'rxjs';
import { switchMap, map, catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {
  createAction,
  props,
  createReducer,
  on,
  createFeatureSelector,
  createSelector,
  Store
} from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';

// ---------------------------------------------------------------------------
// 1. Domain Models
// ---------------------------------------------------------------------------
export interface Character {
  id: number;
  name: string;
  status: 'Alive' | 'Dead' | 'unknown';
  species: string;
  image: string;
}

export interface CharacterApiResponse {
  info: { count: number; pages: number };
  results: Character[];
}

// ---------------------------------------------------------------------------
// 2. Action Creators
// ---------------------------------------------------------------------------
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

export const setSearchQuery = createAction(
  '[Characters] Set Search Query',
  props<{ query: string }>()
);

// ---------------------------------------------------------------------------
// 3. State Schema & Pure Reducer
// ---------------------------------------------------------------------------
export interface CharactersState {
  characters: Character[];
  totalCharacters: number;
  searchQuery: string;
  loading: boolean;
  error: string | null;
}

export const initialCharactersState: CharactersState = {
  characters: [],
  totalCharacters: 0,
  searchQuery: '',
  loading: false,
  error: null
};

export const charactersReducer = createReducer(
  initialCharactersState,

  on(loadCharacters, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(loadCharactersSuccess, (state, { response }) => ({
    ...state,
    characters: response.results || [],
    totalCharacters: response.info?.count || 0,
    loading: false,
    error: null
  })),

  on(loadCharactersFailure, (state, { error }) => ({
    ...state,
    characters: [],
    totalCharacters: 0,
    loading: false,
    error
  })),

  on(setSearchQuery, (state, { query }) => ({
    ...state,
    searchQuery: query
  }))
);

// ---------------------------------------------------------------------------
// 4. Memoized Selectors
// ---------------------------------------------------------------------------
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

export const selectCharactersCount = createSelector(
  selectCharactersState,
  (state) => state.totalCharacters
);

// ---------------------------------------------------------------------------
// 5. Reactive Side-Effect Class
// ---------------------------------------------------------------------------
export class CharactersEffects {
  private readonly actions$ = inject(Actions);
  private readonly http = inject(HttpClient);

  loadCharacters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadCharacters),
      // switchMap automatically cancels stale in-flight HTTP requests
      switchMap(({ page, name }) => {
        const queryParam = name ? `&name=${encodeURIComponent(name)}` : '';
        const url = `https://rickandmortyapi.com/api/character?page=${page}${queryParam}`;

        return this.http.get<CharacterApiResponse>(url).pipe(
          map((response) => loadCharactersSuccess({ response })),
          catchError((err) =>
            of(loadCharactersFailure({ error: err.message || 'API Error' }))
          )
        );
      })
    )
  );

  searchCharacters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setSearchQuery),
      debounceTime(350),
      distinctUntilChanged((prev, curr) => prev.query === curr.query),
      map(({ query }) => loadCharacters({ page: 1, name: query }))
    )
  );
}

// ---------------------------------------------------------------------------
// 6. Standalone Component with Signal-Store Bridge & Lifecycle Teardown
// ---------------------------------------------------------------------------
@Component({
  selector: 'app-character-directory',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="character-container">
      @if (loading()) {
        <p>Loading characters...</p>
      } @else {
        <p>Total Characters: {{ totalCount() }}</p>
        <div class="grid">
          @for (char of characters(); track char.id) {
            <article class="card">
              <img [src]="char.image" [alt]="char.name" />
              <h3>{{ char.name }}</h3>
              <p>{{ char.species }} • {{ char.status }}</p>
            </article>
          }
        </div>
      }
    </div>
  `
})
export class CharacterDirectoryComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly subscriptions = new Subscription();

  // Signals derived from NgRx Store selectors
  readonly characters = this.store.selectSignal(selectAllCharacters);
  readonly loading = this.store.selectSignal(selectCharactersLoading);
  readonly totalCount = this.store.selectSignal(selectCharactersCount);

  ngOnInit(): void {
    // Initial fetch dispatch
    this.store.dispatch(loadCharacters({ page: 1 }));
  }

  onSearch(query: string): void {
    this.store.dispatch(setSearchQuery({ query }));
  }

  ngOnDestroy(): void {
    // Guaranteed teardown of any long-lived RxJS subscriptions
    this.subscriptions.unsubscribe();
  }
}

