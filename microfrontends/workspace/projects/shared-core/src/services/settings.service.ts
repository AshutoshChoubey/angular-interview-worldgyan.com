import { Injectable, signal, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppTheme, UserSettings } from '../models/settings.model';

const API_BASE = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly http = inject(HttpClient);

  readonly theme = signal<AppTheme>('dark');
  readonly language = signal<string>('en');

  constructor() {
    this.initFromDom();

    effect(() => {
      const currentTheme = this.theme();
      const currentLang = this.language();

      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', currentTheme);
        document.documentElement.setAttribute('lang', currentLang);

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
    this.syncSettingsWithBackend();
  }

  setLanguage(language: string): void {
    this.language.set(language);
    this.syncSettingsWithBackend();
  }

  loadRemoteSettings(): void {
    this.http.get<UserSettings>(`${API_BASE}/user/settings`).subscribe({
      next: (settings) => {
        if (settings.theme) this.theme.set(settings.theme);
        if (settings.language) this.language.set(settings.language);
      },
      error: () => {}
    });
  }

  private syncSettingsWithBackend(): void {
    this.http.put(`${API_BASE}/user/settings`, {
      theme: this.theme(),
      language: this.language()
    }).subscribe({
      error: () => console.warn('[SettingsService] Telemetry settings sync failed.')
    });
  }

  private initFromDom(): void {
    if (typeof document !== 'undefined') {
      const existingTheme = document.documentElement.getAttribute('data-theme') as AppTheme;
      if (existingTheme === 'light' || existingTheme === 'dark') {
        this.theme.set(existingTheme);
      }
    }
  }
}

