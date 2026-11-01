import { Component, OnInit, inject, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { SettingsService, AuthService } from '@shared/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="dashboard-page">
      <div class="hero-card">
        <h2>Enterprise Aggregator Executive Control Center</h2>
        <p class="hero-desc">Orchestrating routed microfrontends and autonomous Angular Elements Web Components.</p>
        <div class="telemetry-log">
          <span class="telemetry-label">EVENT STREAM:</span>
          <span>{{ telemetryMessage() }}</span>
        </div>
      </div>

      @if (isWidgetsLoaded()) {
        <div class="widgets-container">
          <fm-status-widget
            [attr.theme]="settingsService.theme()"
            [attr.severity-filter]="activeFilter()"
            (alertClick)="onAlertReceived($event)">
          </fm-status-widget>

          <topology-summary-widget
            [attr.theme]="settingsService.theme()"
            [attr.cluster-id]="targetCluster()"
            (nodeSelect)="onNodeReceived($event)">
          </topology-summary-widget>
        </div>
      } @else {
        <div class="loading-state">
          <span>Mounting federated Web Component bundles from port 4203...</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-page { max-width: 1440px; margin: 2rem auto; padding: 0 1.5rem; display: flex; flex-direction: column; gap: 2rem; }
    .hero-card { background: var(--bg-surface, #111827); border: 1px solid var(--border-subtle, #374151); border-radius: 12px; padding: 1.75rem; }
    .hero-desc { color: var(--text-secondary, #9ca3af); font-size: 0.95rem; margin-top: 0.35rem; }
    .telemetry-log { margin-top: 1.25rem; padding: 0.85rem 1.25rem; background: var(--bg-core, #090d16); border-left: 4px solid #38bdf8; border-radius: 4px; font-family: monospace; font-size: 0.85rem; }
    .telemetry-label { color: #38bdf8; font-weight: 700; margin-right: 0.5rem; }
    .widgets-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(480px, 1fr)); gap: 1.5rem; }
    .loading-state { text-align: center; padding: 3rem; background: var(--bg-surface, #111827); border-radius: 12px; color: #9ca3af; }
  `]
})
export class DashboardComponent implements OnInit {
  readonly settingsService = inject(SettingsService);
  readonly authService = inject(AuthService);

  readonly isWidgetsLoaded = signal(false);
  readonly activeFilter = signal('ALL');
  readonly targetCluster = signal('cluster-core-east');
  readonly telemetryMessage = signal('Listening for CustomElement events...');

  async ngOnInit(): Promise<void> {
    try {
      await loadRemoteModule('dashboard-widgets', './Widgets');
      this.isWidgetsLoaded.set(true);
    } catch (err) {
      console.error('[Dashboard] Error mounting widgets remote:', err);
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
