/**
 * @file 06-shell-dashboard-component.ts
 * @description Shell Dashboard Embedding Native Angular Elements (Web Components)
 * @framework Angular 22+ (CUSTOM_ELEMENTS_SCHEMA, loadRemoteModule, Signals)
 */

import { Component, OnInit, inject, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { SettingsService, AuthService } from '@shared/core';

@Component({
  selector: 'app-shell-dashboard',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Mandatory: permits custom HTML tags without compiler errors
  template: `
    <div class="dashboard-page">
      <div class="hero-card">
        <h2>Enterprise Aggregator Executive Control Center</h2>
        <p class="hero-desc">
          Unified cockpit orchestrating routed microfrontends and autonomous Angular Elements Web Components.
        </p>

        <!-- Live Telemetry Stream from Web Components -->
        <div class="telemetry-log">
          <span class="telemetry-label">CUSTOM DOM EVENT STREAM:</span>
          <span class="telemetry-val">{{ telemetryMessage() }}</span>
        </div>
      </div>

      <!-- Federated Web Component Widgets Container -->
      @if (isWidgetsLoaded()) {
        <div class="widgets-container">
          <!-- Web Component 1: Fault Management Status Widget -->
          <fm-status-widget
            [attr.theme]="settingsService.theme()"
            [attr.severity-filter]="activeFilter()"
            (alertClick)="onAlertReceived($event)">
          </fm-status-widget>

          <!-- Web Component 2: Topology Summary Status Widget -->
          <topology-summary-widget
            [attr.theme]="settingsService.theme()"
            [attr.cluster-id]="targetCluster()"
            (nodeSelect)="onNodeReceived($event)">
          </topology-summary-widget>
        </div>
      } @else {
        <div class="loading-state">
          <div class="spinner"></div>
          <span>Mounting federated Web Component bundles from port 4203...</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-page {
      max-width: 1440px;
      margin: 2rem auto;
      padding: 0 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    .hero-card {
      background: var(--bg-surface, #111827);
      border: 1px solid var(--border-subtle, #374151);
      border-radius: 12px;
      padding: 1.75rem;
    }
    .hero-desc { color: var(--text-secondary, #9ca3af); font-size: 0.95rem; margin-top: 0.35rem; }
    .telemetry-log {
      margin-top: 1.25rem;
      padding: 0.85rem 1.25rem;
      background: var(--bg-core, #090d16);
      border-left: 4px solid var(--accent-cyan, #38bdf8);
      border-radius: 4px;
      font-family: monospace;
      font-size: 0.85rem;
    }
    .telemetry-label { color: var(--accent-cyan, #38bdf8); font-weight: 700; margin-right: 0.5rem; }
    .telemetry-val { color: var(--text-primary, #f9fafb); }
    .widgets-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
      gap: 1.5rem;
    }
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 4rem;
      background: var(--bg-surface, #111827);
      border-radius: 12px;
      color: var(--text-muted, #6b7280);
    }
    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid rgba(56, 189, 248, 0.2);
      border-top-color: #38bdf8;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class DashboardComponent implements OnInit {
  readonly settingsService = inject(SettingsService);
  readonly authService = inject(AuthService);

  readonly isWidgetsLoaded = signal<boolean>(false);
  readonly activeFilter = signal<string>('ALL');
  readonly targetCluster = signal<string>('cluster-core-east');
  readonly telemetryMessage = signal<string>('Listening for CustomElement events...');

  async ngOnInit(): Promise<void> {
    try {
      // Lazily download and execute the Angular Elements registration bundle
      await loadRemoteModule('dashboard-widgets', './Widgets');
      this.isWidgetsLoaded.set(true);
    } catch (err) {
      console.error('[Dashboard] Web Component remote initialization failure:', err);
    }
  }

  onAlertReceived(event: any): void {
    const detail = event.detail || event;
    this.telemetryMessage.set(`[<fm-status-widget>] ${detail.severity} Alarm ${detail.alarmId}: ${detail.message}`);
  }

  onNodeReceived(event: any): void {
    const detail = event.detail || event;
    this.telemetryMessage.set(`[<topology-summary-widget>] Node Selected: ${detail.nodeId} (${detail.ip}) -> ${detail.status}`);
  }
}

