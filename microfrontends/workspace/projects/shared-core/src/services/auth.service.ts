import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { UserProfile } from '../models/auth.model';

const TOKEN_STORAGE_KEY = 'aggregator_auth_token';
const API_BASE = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly userSignal = signal<UserProfile | null>(null);
  private readonly tokenSignal = signal<string | null>(this.getStoredToken());
  private readonly loadingSignal = signal<boolean>(false);

  readonly user = this.userSignal.asReadonly();
  readonly token = this.tokenSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();

  readonly isAuthenticated = computed(() => !!this.tokenSignal() && !!this.userSignal());
  readonly roles = computed(() => this.userSignal()?.roles ?? []);
  readonly permissions = computed(() => this.userSignal()?.permissions ?? []);

  constructor() {
    if (this.tokenSignal()) {
      this.fetchCurrentUser().subscribe();
    }
  }

  login(credentials: { username: string; password: string }): Observable<{ token: string; user: UserProfile }> {
    this.loadingSignal.set(true);
    return this.http.post<{ token: string; user: UserProfile }>(`${API_BASE}/auth/login`, credentials).pipe(
      tap(({ token, user }) => {
        sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
        this.tokenSignal.set(token);
        this.userSignal.set(user);
        this.loadingSignal.set(false);
      }),
      catchError(err => {
        this.loadingSignal.set(false);
        throw err;
      })
    );
  }

  logout(): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${API_BASE}/auth/logout`, {}).pipe(
      tap(() => this.clearSession()),
      catchError(() => {
        this.clearSession();
        return of({ success: true });
      })
    );
  }

  fetchCurrentUser(): Observable<{ user: UserProfile } | null> {
    const token = this.tokenSignal();
    if (!token) return of(null);

    return this.http.get<{ user: UserProfile }>(`${API_BASE}/auth/me`).pipe(
      tap(({ user }) => this.userSignal.set(user)),
      catchError(() => {
        this.clearSession();
        return of(null);
      })
    );
  }

  private getStoredToken(): string | null {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return sessionStorage.getItem(TOKEN_STORAGE_KEY);
    }
    return null;
  }

  private clearSession(): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    this.tokenSignal.set(null);
    this.userSignal.set(null);
  }
}

