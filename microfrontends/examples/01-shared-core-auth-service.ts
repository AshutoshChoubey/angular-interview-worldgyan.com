/**
 * @file 01-shared-core-auth-service.ts
 * @description Enterprise Singleton Authentication & RBAC Service (@shared/core)
 * @framework Angular 22+ (Zoneless, Signals, Native Federation Singleton)
 * 
 * Shared across Host Shell and Remote MFEs via Native Federation:
 * - singleton: true, strictVersion: true
 * - Reactive state: Angular Signals (user, token, isAuthenticated, roles)
 * - Automatic SessionStorage synchronization
 */

import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  roles: string[];
  permissions: string[];
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

const TOKEN_KEY = 'enterprise_auth_jwt';
const API_BASE = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);

  // Private reactive state primitives
  private readonly userSignal = signal<UserProfile | null>(null);
  private readonly tokenSignal = signal<string | null>(this.getInitialToken());
  private readonly loadingSignal = signal<boolean>(false);

  // Public readonly views exposed to consumer MFEs
  readonly user = this.userSignal.asReadonly();
  readonly token = this.tokenSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();

  // Computed state ($O(1)$ push-pull reactivity)
  readonly isAuthenticated = computed(() => !!this.tokenSignal() && !!this.userSignal());
  readonly roles = computed(() => this.userSignal()?.roles ?? []);
  readonly permissions = computed(() => this.userSignal()?.permissions ?? []);

  constructor() {
    // Cold-start session hydration
    if (this.tokenSignal()) {
      this.fetchCurrentUser().subscribe();
    }
  }

  /**
   * Enterprise Login
   */
  login(credentials: { username: string; password: string }): Observable<AuthResponse> {
    this.loadingSignal.set(true);
    return this.http.post<AuthResponse>(`${API_BASE}/auth/login`, credentials).pipe(
      tap(({ token, user }) => {
        this.persistToken(token);
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

  /**
   * Enterprise Logout
   */
  logout(): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${API_BASE}/auth/logout`, {}).pipe(
      tap(() => this.clearSession()),
      catchError(() => {
        this.clearSession();
        return of({ success: true });
      })
    );
  }

  /**
   * Hydrate active user profile from Bearer token
   */
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

  hasRole(requiredRole: string): boolean {
    return this.roles().includes(requiredRole);
  }

  hasPermission(requiredPermission: string): boolean {
    return this.permissions().includes(requiredPermission);
  }

  private persistToken(token: string): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(TOKEN_KEY, token);
    }
  }

  private getInitialToken(): string | null {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage.getItem(TOKEN_KEY);
    }
    return null;
  }

  private clearSession(): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem(TOKEN_KEY);
    }
    this.tokenSignal.set(null);
    this.userSignal.set(null);
  }
}
