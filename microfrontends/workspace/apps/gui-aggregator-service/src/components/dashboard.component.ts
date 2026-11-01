import { Component, OnInit, inject, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { SettingsService, AuthService, TelemetryBusService } from '@shared/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="dashboard-page">
      <!-- Hero & Architecture Overview -->
      <div class="hero-card">
        <div class="hero-top">
          <div>
            <h2>Microfrontends Bidirectional Data Exchange</h2>
            <p class="hero-desc">
              Demonstrating <strong>Parent-to-Child</strong> (props/attributes), <strong>Child-to-Parent</strong> (custom DOM events), and <strong>Adjacent Sibling-to-Sibling</strong> (shared singleton reactive signal store & event bus).
            </p>
          </div>
          <div class="legend-pills">
            <span class="pill parent">Parent ➜ Child</span>
            <span class="pill child">Child ➜ Parent</span>
            <span class="pill sibling">Sibling ⟷ Sibling</span>
          </div>
        </div>

        <!-- Vector 1: Parent-to-Child Interactive Injection Controls -->
        <div class="parent-control-deck">
          <span class="deck-title">Parent Control Deck (Inject Data to Children):</span>
          <div class="deck-buttons">
            <button class="btn-ctrl" (click)="injectTargetEntity('core-router-01.us-east')">
              Inject Entity: <code>core-router-01</code>
            </button>
            <button class="btn-ctrl" (click)="injectTargetEntity('switch-spine-04.us-east')">
              Inject Entity: <code>switch-spine-04</code>
            </button>
            <button class="btn-ctrl" (click)="injectCluster('cluster-edge-eu')">
              Switch Cluster: <code>cluster-edge-eu</code>
            </button>
            <button class="btn-ctrl" (click)="injectSeverityFilter('CRITICAL')">
              Set Severity: <code>CRITICAL</code>
            </button>
            <button class="btn-ctrl reset" (click)="resetAllControls()">
              ↺ Reset Context
            </button>
          </div>
        </div>

        <!-- Vector 2: Live Child-to-Parent Event Console -->
        <div class="telemetry-bar">
          <div class="telemetry-item">
            <span class="badge child">Child ➜ Parent Event</span>
            <span class="msg font-mono">{{ lastChildEvent() }}</span>
          </div>
        </div>
      </div>

      <!-- Federated Embedded Web Components (Children) -->
      @if (isWidgetsLoaded()) {
        <div class="widgets-container">
          <!-- Child Widget 1: Fault Management Status Widget -->
          <fm-status-widget
            [attr.theme]="settingsService.theme()"
            [attr.severity-filter]="activeFilter()"
            [attr.selected-entity]="parentInjectedEntity()"
            (alertClick)="onAlertReceived($event)">
          </fm-status-widget>

          <!-- Child Widget 2: Topology Summary Status Widget -->
          <topology-summary-widget
            [attr.theme]="settingsService.theme()"
            [attr.cluster-id]="targetCluster()"
            [attr.highlight-entity]="parentInjectedEntity()"
            (nodeSelect)="onNodeReceived($event)">
          </topology-summary-widget>
        </div>
      } @else {
        <div class="loading-state">
          <span>Mounting federated Web Component bundles from port 4203...</span>
        </div>
      }

      <!-- Vector 3: Real-Time Sibling-to-Sibling Bus Event Audit Stream -->
      <div class="audit-card">
        <div class="audit-header">
          <h3>⚡ Cross-MFE Telemetry Event Bus Audit Trail</h3>
          <span class="audit-status">Active Singleton Signals: <strong>{{ telemetryBus.eventAuditLog().length }}</strong> events recorded</span>
        </div>

        <div class="audit-table-wrapper">
          <table class="audit-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Vector Direction</th>
                <th>Source MFE</th>
                <th>Target MFE</th>
                <th>Topic</th>
                <th>Payload Transferred</th>
              </tr>
            </thead>
            <tbody>
              @for (evt of telemetryBus.recentEvents(); track evt.id) {
                <tr>
                  <td class="font-mono text-muted">{{ evt.timestamp }}</td>
                  <td>
                    <span class="dir-badge" [attr.data-dir]="evt.direction">
                      {{ evt.direction }}
                    </span>
                  </td>
                  <td><code class="app-tag">{{ evt.sourceApp }}</code></td>
                  <td><code class="app-tag">{{ evt.targetApp }}</code></td>
                  <td><strong>{{ evt.topic }}</strong></td>
                  <td class="font-mono payload-cell">{{ formatPayload(evt.payload) }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="empty-cell">Interact with counters or nodes above to generate cross-MFE telemetry.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page { max-width: 1440px; margin: 2rem auto; padding: 0 1.5rem; display: flex; flex-direction: column; gap: 1.75rem; }
    .hero-card { background: var(--bg-surface, #111827); border: 1px solid var(--border-subtle, #374151); border-radius: 12px; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
    .hero-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
    .hero-desc { color: var(--text-secondary, #9ca3af); font-size: 0.9rem; margin-top: 0.35rem; }
    .legend-pills { display: flex; gap: 0.5rem; }
    .pill { font-size: 0.7rem; font-weight: 700; padding: 0.25rem 0.6rem; border-radius: 20px; }
    .pill.parent { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid #38bdf8; }
    .pill.child { background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid #10b981; }
    .pill.sibling { background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid #f59e0b; }
    .parent-control-deck { background: rgba(0, 0, 0, 0.2); border: 1px solid #374151; border-radius: 8px; padding: 0.85rem 1rem; }
    .deck-title { display: block; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #9ca3af; margin-bottom: 0.5rem; }
    .deck-buttons { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .btn-ctrl { background: #1f2937; border: 1px solid #374151; color: #f9fafb; padding: 0.35rem 0.75rem; border-radius: 6px; font-size: 0.78rem; cursor: pointer; transition: all 0.15s; }
    .btn-ctrl:hover { background: #374151; border-color: #38bdf8; }
    .btn-ctrl.reset { background: rgba(239, 68, 68, 0.15); color: #ef4444; border-color: #ef4444; margin-left: auto; }
    .telemetry-bar { background: var(--bg-core, #090d16); border-radius: 6px; padding: 0.65rem 1rem; border-left: 4px solid #10b981; }
    .telemetry-item { display: flex; align-items: center; gap: 0.75rem; font-size: 0.825rem; }
    .badge { font-size: 0.7rem; font-weight: 800; padding: 0.15rem 0.45rem; border-radius: 4px; text-transform: uppercase; }
    .badge.child { background: rgba(16, 185, 129, 0.2); color: #10b981; }
    .widgets-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(480px, 1fr)); gap: 1.5rem; }
    .loading-state { text-align: center; padding: 3rem; background: var(--bg-surface, #111827); border-radius: 12px; color: #9ca3af; }
    .audit-card { background: var(--bg-surface, #111827); border: 1px solid var(--border-subtle, #374151); border-radius: 12px; padding: 1.5rem; }
    .audit-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .audit-header h3 { font-size: 1.05rem; }
    .audit-status { font-size: 0.8rem; color: #9ca3af; }
    .audit-table-wrapper { overflow-x: auto; }
    .audit-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.825rem; }
    .audit-table th, .audit-table td { padding: 0.65rem 0.85rem; border-bottom: 1px solid #374151; }
    .audit-table th { background: #1f2937; color: #9ca3af; font-weight: 700; }
    .dir-badge { display: inline-block; padding: 0.15rem 0.45rem; border-radius: 4px; font-size: 0.7rem; font-weight: 800; }
    .dir-badge[data-dir='PARENT_TO_CHILD'] { background: rgba(56, 189, 248, 0.15); color: #38bdf8; }
    .dir-badge[data-dir='CHILD_TO_PARENT'] { background: rgba(16, 185, 129, 0.15); color: #10b981; }
    .dir-badge[data-dir='ADJACENT_SIBLING'] { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
    .app-tag { font-size: 0.75rem; background: rgba(0,0,0,0.3); padding: 0.15rem 0.35rem; border-radius: 4px; color: #e2e8f0; }
    .payload-cell { font-size: 0.75rem; color: #9ca3af; max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .empty-cell { text-align: center; padding: 2rem; color: #6b7280; }
    .font-mono { font-family: monospace; }
    .text-muted { color: #6b7280; }
  `]
})
export class DashboardComponent implements OnInit {
  readonly settingsService = inject(SettingsService);
  readonly authService = inject(AuthService);
  readonly telemetryBus = inject(TelemetryBusService);

  readonly isWidgetsLoaded = signal(false);

  // Vector 1 (Parent -> Child state)
  readonly activeFilter = signal('ALL');
  readonly targetCluster = signal('cluster-core-east');
  readonly parentInjectedEntity = signal<string | null>(null);

  // Vector 2 (Child -> Parent state)
  readonly lastChildEvent = signal('Awaiting CustomEvents from child microfrontends...');

  async ngOnInit(): Promise<void> {
    try {
      await loadRemoteModule('dashboard-widgets', './Widgets');
      this.isWidgetsLoaded.set(true);
    } catch (err) {
      console.error('[Dashboard] Error mounting widgets remote:', err);
    }
  }

  // Vector 1: Parent controls injecting data down
  injectTargetEntity(entity: string): void {
    this.parentInjectedEntity.set(entity);
    this.telemetryBus.selectEntity(entity, 'HOST_SHELL');
  }

  injectCluster(clusterId: string): void {
    this.targetCluster.set(clusterId);
    this.telemetryBus.selectCluster(clusterId, 'HOST_SHELL');
  }

  injectSeverityFilter(filter: string): void {
    this.activeFilter.set(filter);
  }

  resetAllControls(): void {
    this.parentInjectedEntity.set(null);
    this.activeFilter.set('ALL');
    this.targetCluster.set('cluster-core-east');
    this.telemetryBus.clearFocus('HOST_SHELL');
    this.lastChildEvent.set('Context reset by Parent Host Shell.');
  }

  // Vector 2: Receiving events from child Web Components
  onAlertReceived(event: any): void {
    const detail = event.detail || event;
    this.lastChildEvent.set(
      `Received (alertClick) from <fm-status-widget>: Alarm ${detail.alarmId} on ${detail.entity} (${detail.severity})`
    );
  }

  onNodeReceived(event: any): void {
    const detail = event.detail || event;
    this.lastChildEvent.set(
      `Received (nodeSelect) from <topology-summary-widget>: Selected ${detail.nodeId} (${detail.ip})`
    );
  }

  formatPayload(payload: any): string {
    return JSON.stringify(payload);
  }
}
