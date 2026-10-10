import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, switchMap, catchError, of } from 'rxjs';

/**
 * Example 5: RxJS & Signals Interoperability
 * Covers: toSignal(), toObservable(), injection context lifecycle, and combining strengths
 */

interface Article {
  id: number;
  title: string;
  category: string;
}

@Component({
  selector: 'app-article-search',
  standalone: true,
  template: `
    <div>
      <input
        type="text"
        [value]="searchTerm()"
        (input)="onSearchInput($event)"
        placeholder="Search articles..."
      />

      <p>Results for: {{ searchTerm() }}</p>
      <ul>
        @for (article of articles(); track article.id) {
          <li>{{ article.title }}</li>
        }
      </ul>
    </div>
  `
})
export class ArticleSearchComponent {
  private http = inject(HttpClient);

  // 1. Signal for immediate user typing (synchronous UI state)
  searchTerm = signal<string>('');

  // 2. Convert Signal -> Observable to apply RxJS async operators (debounce, switchMap)
  private debouncedSearch$ = toObservable(this.searchTerm).pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(query => {
      if (!query.trim()) return of([]);
      return this.http.get<Article[]>(`/api/articles?q=${encodeURIComponent(query)}`).pipe(
        catchError(err => {
          console.error('Search failed', err);
          return of([]);
        })
      );
    })
  );

  // 3. Convert Observable back to Signal for clean, declarative template consumption
  // Automatically unsubscribes on component destruction!
  articles = toSignal(this.debouncedSearch$, { initialValue: [] });

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }
}
