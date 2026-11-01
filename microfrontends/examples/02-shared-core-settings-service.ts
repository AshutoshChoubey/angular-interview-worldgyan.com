/**
 * @file 02-shared-core-settings-service.ts
 * @description Enterprise Singleton UI Preferences & Design System State (@shared/core)
 * @framework Angular 22+ (Zoneless, Signals, Native Federation Singleton)
 * 
 * Synchronizes Theme and Language preferences across:
 * 1. Root DOM element (<html data-theme="...">)
 * 2. Window-level broadcast event (CustomEvent for Web Components & Microfrontends)
 * 3. Remote Backend API persistence (PUT /api/user/settings)
 */

import { Injectable, signal, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type AppTheme = 'light' | 'dark';

export interface UserSettings {
  theme: AppTheme;
  language: string;
}

const API_BASE = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly http = inject(HttpClient);

  // Reactive UI state
  readonly theme = signal<AppTheme>('dark');
  readonly language = signal<string>('en');

  constructor() {
    this.hydrateFromDom();

    // Reactive effect: Automatically executes whenever theme or language signal updates
    effect(() => {
      const currentTheme = this.theme();
      const currentLang = this.language();

      if (typeof document !== 'undefined') {
        // 1. Synchronize Document Root attributes
        document.documentElement.setAttribute('data-theme', currentTheme);
        document.documentElement.setAttribute('lang', currentLang);

        // 2. Broadcast CustomEvent to un-scoped Shadow DOMs and Custom Elements
        window.dispatchEvent(
          new CustomEvent('gui-settings-change', {
            detail: { theme: currentTheme, language: currentLang }
          })
        );
      }
    });
  }

  toggleTheme(): void {
    const nextTheme: AppTheme = this.theme() === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
  }

  setTheme(theme: AppTheme): void {
    this.theme.set(theme);
    this.persistSettings();
  }

  setLanguage(language: string): void {
    this.language.set(language);
    this.persistSettings();
  }

  loadRemoteSettings(): void {
    this.http.get<UserSettings>(`${API_BASE}/user/settings`).subscribe({
      next: (settings) => {
        if (settings.theme) this.theme.set(settings.theme);
        if (settings.language) this.language.set(settings.language);
      },
      error: (err) => {
        console.warn('[SettingsService] Telemetry sync fallback (local default maintained):', err);
      }
    });
  }

  private persistSettings(): void {
    this.http.put(`${API_BASE}/user/settings`, {
      theme: this.theme(),
      language: this.language()
    }).subscribe({
      error: (err) => console.warn('[SettingsService] Async backend update failed:', err)
    });
  }

  private hydrateFromDom(): void {
    if (typeof document !== 'undefined') {
      const existingTheme = document.documentElement.getAttribute('data-theme') as AppTheme;
      if (existingTheme === 'light' || existingTheme === 'dark') {
        this.theme.set(existingTheme);
      }
      const existingLang = document.documentElement.getAttribute('lang');
      if (existingLang) {
        this.language.set(existingLang);
      }
    }
  }
}

