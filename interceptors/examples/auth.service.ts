/**
 * Enterprise Signal-Based AuthService
 * 
 * Demonstrates:
 * - Managing currentUser and accessToken with fine-grained Signals
 * - asReadonly() projections for immutable public consumption
 * - computed() isAuthenticated derivation ($O(1)$ reactivity)
 * - Safe silent refresh call returning Observable
 */
import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'editor';
}

export interface AuthTokens {
  accessToken: string;
  expiresIn: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  // Private mutable Signal state
  private _currentUser = signal<User | null>(null);
  private _accessToken = signal<string | null>(null);

  // Public immutable read-only signals
  readonly currentUser = this._currentUser.asReadonly();
  readonly accessToken = this._accessToken.asReadonly();

  // Computed projection: updates synchronously with zero Zone.js overhead
  readonly isAuthenticated = computed(() => !!this._currentUser());
  readonly isAdmin = computed(() => this._currentUser()?.role === 'admin');

  /**
   * Request silent token refresh from the backend.
   * Note: The refresh token should be kept in an HttpOnly, Secure cookie.
   */
  refreshToken(): Observable<AuthTokens> {
    return this.http.post<AuthTokens>('/api/auth/refresh', {}).pipe(
      tap((tokens) => {
        this._accessToken.set(tokens.accessToken);
      })
    );
  }

  setSession(user: User, accessToken: string) {
    this._currentUser.set(user);
    this._accessToken.set(accessToken);
  }

  logout() {
    this._currentUser.set(null);
    this._accessToken.set(null);
  }
}

