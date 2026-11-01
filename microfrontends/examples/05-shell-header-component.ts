/**
 * @file 05-shell-header-component.ts
 * @description Enterprise Shell Top Navigation Bar with Embedded Settings Manager & Auth Controls
 * @framework Angular 22+ (Standalone Component, Signals, Modern Control Flow)
 */

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, SettingsService } from '@shared/core';

@Component({
  selector: 'app-shell-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="header-bar">
      <!-- Left: Enterprise Branding & Dynamic Nav -->
      <div class="brand-section">
        <a routerLink="/dashboard" class="logo-container">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
          <span class="brand-text">WORLDGYAN CORE MFE</span>
        </a>

        <nav class="nav-links">
          <a routerLink="/dashboard" routerLinkActive="active-link" class="nav-link">Dashboard</a>
          <a routerLink="/fault-management" routerLinkActive="active-link" class="nav-link">Fault Management</a>
          <a routerLink="/topology" routerLinkActive="active-link" class="nav-link">Topology</a>
        </nav>
      </div>

      <!-- Right: User Auth Badge & UI Preferences Gear -->
      <div class="actions-section">
        @if (authService.isAuthenticated()) {
          <div class="profile-badge">
            <span class="status-indicator online"></span>
            <span class="user-name">{{ authService.user()?.fullName }}</span>
            <button (click)="handleLogout()" class="btn-auth btn-logout">Logout</button>
          </div>
        } @else {
          <button (click)="handleLogin()" class="btn-auth btn-login">Enterprise Login</button>
        }

        <!-- Settings Gear Dropdown Toggle -->
        <button (click)="toggleSettings()" class="gear-btn" aria-label="Open UI Preferences">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>

        <!-- Embedded Settings Manager Panel -->
        @if (isSettingsOpen()) {
          <div class="settings-dropdown">
            <div class="settings-title">UI Preferences Manager</div>

            <div class="setting-row">
              <span class="setting-label">Display Theme:</span>
              <button (click)="settingsService.toggleTheme()" class="theme-toggle-btn">
                {{ settingsService.theme() === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode' }}
              </button>
            </div>

            <div class="setting-row">
              <span class="setting-label">Locale Preference:</span>
              <select
                [value]="settingsService.language()"
                (change)="onLanguageChange($event)"
                class="locale-select">
                <option value="en">English (US)</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>
        }
      </div>
    </header>
  `,
  styles: [`
    .header-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
      padding: 0 1.75rem;
      background: var(--bg-surface, #111827);
      border-bottom: 1px solid var(--border-subtle, #374151);
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    .brand-section { display: flex; align-items: center; gap: 1.5rem; }
    .logo-container {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      text-decoration: none;
      color: var(--text-primary, #f9fafb);
      font-weight: 800;
      font-size: 1.1rem;
    }
    .brand-text { letter-spacing: -0.02em; }
    .nav-links { display: flex; gap: 0.5rem; }
    .nav-link {
      padding: 0.45rem 0.85rem;
      border-radius: 6px;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-secondary, #9ca3af);
      transition: all 0.2s ease;
    }
    .nav-link:hover {
      color: var(--text-primary, #ffffff);
      background: var(--bg-surface-elevated, #1f2937);
    }
    .nav-link.active-link {
      color: var(--accent-cyan, #38bdf8);
      background: rgba(56, 189, 248, 0.12);
      border: 1px solid var(--accent-cyan, #38bdf8);
    }
    .actions-section { display: flex; align-items: center; gap: 1rem; position: relative; }
    .profile-badge {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.35rem 0.75rem;
      background: var(--bg-surface-elevated, #1f2937);
      border-radius: 20px;
      font-size: 0.825rem;
    }
    .status-indicator { width: 8px; height: 8px; border-radius: 50%; }
    .status-indicator.online { background: #10b981; }
    .user-name { font-weight: 600; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .btn-auth {
      padding: 0.35rem 0.8rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      border: none;
    }
    .btn-login { background: #38bdf8; color: #000; }
    .btn-logout { background: #ef4444; color: #fff; }
    .gear-btn {
      background: transparent;
      border: 1px solid var(--border-subtle, #374151);
      border-radius: 8px;
      padding: 0.45rem;
      color: var(--text-primary, #f9fafb);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    .gear-btn:hover { background: var(--bg-surface-elevated, #1f2937); }
    .settings-dropdown {
      position: absolute;
      top: 55px;
      right: 0;
      width: 290px;
      background: var(--bg-surface, #111827);
      border: 1px solid var(--border-subtle, #374151);
      border-radius: 10px;
      padding: 1.25rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4);
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .settings-title {
      font-size: 0.8rem;
      text-transform: uppercase;
      font-weight: 800;
      color: var(--text-muted, #6b7280);
      letter-spacing: 0.05em;
    }
    .setting-row { display: flex; justify-content: space-between; align-items: center; }
    .setting-label { font-size: 0.85rem; font-weight: 600; }
    .theme-toggle-btn {
      padding: 0.35rem 0.75rem;
      background: var(--bg-surface-elevated, #1f2937);
      color: var(--text-primary, #ffffff);
      border: 1px solid var(--border-subtle, #374151);
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.825rem;
      font-weight: 600;
    }
    .locale-select {
      padding: 0.35rem 0.65rem;
      background: var(--bg-surface-elevated, #1f2937);
      color: var(--text-primary, #ffffff);
      border: 1px solid var(--border-subtle, #374151);
      border-radius: 6px;
      font-size: 0.825rem;
    }
  `]
})
export class ShellHeaderComponent {
  readonly authService = inject(AuthService);
  readonly settingsService = inject(SettingsService);

  readonly isSettingsOpen = signal(false);

  toggleSettings(): void {
    this.isSettingsOpen.update(v => !v);
  }

  onLanguageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.settingsService.setLanguage(target.value);
    }
  }

  handleLogin(): void {
    this.authService.login({ username: 'admin', password: 'admin123' }).subscribe();
  }

  handleLogout(): void {
    this.authService.logout().subscribe();
  }
}

