import { Component, input, output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TelemetryBusService } from '@shared/core';

@Component({
  selector: 'app-fm-status-widget-impl',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="widget-box" [attr.data-theme]="theme()">
      <div class="widget-header">
        <div>
          <h4>Active Alarms Triage</h4>
          <span class="mfe-badge">Child Widget MFE 1</span>
        </div>
        <span class="pulse-tag">Live Feed</span>
      </div>

      <!-- Adjacent Synced or Parent Injected Entity Notice -->
      @if (currentEntity(); as entity) {
        <div class="sync-banner">
          <span class="sync-icon">⚡</span>
          <span>Synced Entity: <strong>{{ entity }}</strong></span>
        </div>
      }

      <div class="counters-row">
        <div class="counter-card critical" (click)="triggerAlert('CRITICAL', 'core-router-01.us-east', 'ALM-8012')">
          <span class="count">02</span>
          <span class="label">Critical</span>
          <span class="sub-target">core-router-01</span>
        </div>
        <div class="counter-card major" (click)="triggerAlert('MAJOR', 'switch-spine-04.us-east', 'ALM-8013')">
          <span class="count">01</span>
          <span class="label">Major</span>
          <span class="sub-target">switch-spine-04</span>
        </div>
        <div class="counter-card minor" (click)="triggerAlert('MINOR', 'edge-gateway-02.eu-west', 'ALM-8014')">
          <span class="count">01</span>
          <span class="label">Minor</span>
          <span class="sub-target">edge-gateway-02</span>
        </div>
      </div>

      <div class="footer-actions">
        <span>Filter from Parent: <code>{{ severityFilter() }}</code></span>
        <button class="btn-clear" (click)="clearCrossSync()">Clear Sync</button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .widget-box { border: 1px solid #374151; background: #111827; color: #f9fafb; border-radius: 10px; padding: 1.25rem; }
    .widget-box[data-theme='light'] { border-color: #d1d5db; background: #ffffff; color: #111827; }
    .widget-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
    .widget-header h4 { margin: 0; font-size: 0.95rem; font-weight: 700; text-transform: uppercase; }
    .mfe-badge { font-size: 0.65rem; color: #9ca3af; text-transform: uppercase; font-weight: 600; display: block; margin-top: 2px; }
    .pulse-tag { font-size: 0.7rem; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 700; }
    .sync-banner { background: rgba(245, 158, 11, 0.12); border: 1px dashed #f59e0b; border-radius: 6px; padding: 0.4rem 0.75rem; font-size: 0.75rem; color: #f59e0b; margin-bottom: 0.85rem; display: flex; align-items: center; gap: 0.5rem; }
    .counters-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
    .counter-card { padding: 0.85rem 0.5rem; border-radius: 8px; text-align: center; cursor: pointer; transition: transform 0.15s ease; }
    .counter-card:hover { transform: translateY(-2px); }
    .counter-card.critical { background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #ef4444; }
    .counter-card.major { background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); color: #f59e0b; }
    .counter-card.minor { background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; }
    .count { display: block; font-size: 1.5rem; font-weight: 900; line-height: 1; margin-bottom: 0.25rem; }
    .label { font-size: 0.75rem; text-transform: uppercase; font-weight: 700; }
    .sub-target { display: block; font-size: 0.65rem; font-family: monospace; opacity: 0.8; margin-top: 0.35rem; }
    .footer-actions { display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: #9ca3af; margin-top: 1rem; }
    .btn-clear { background: transparent; border: 1px solid #4b5563; color: #9ca3af; font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 4px; cursor: pointer; }
    .btn-clear:hover { background: #374151; color: #fff; }
    code { font-family: monospace; }
  `]
})
export class FmStatusWidgetComponent {
  readonly telemetryBus = inject(TelemetryBusService);

  // Vector 1: Inputs from Parent Host Shell
  readonly theme = input<'light' | 'dark'>('dark');
  readonly severityFilter = input<string>('ALL', { alias: 'severity-filter' });
  readonly selectedEntity = input<string | null>(null, { alias: 'selected-entity' });

  // Combined active entity (resolves from either Parent Prop OR Sibling Signal Bus)
  readonly currentEntity = computed(() => this.selectedEntity() || this.telemetryBus.activeEntity());

  // Vector 2: Output to Parent Host Shell
  readonly alertClick = output<{ alarmId: string; severity: string; message: string; entity: string }>();

  triggerAlert(severity: string, entity: string, alarmId: string): void {
    const payload = {
      alarmId,
      severity,
      entity,
      message: `Fast-triage dispatch initiated for ${entity} (${severity} alarm queue).`
    };

    // 1. Emit to Parent Shell (Child -> Parent)
    this.alertClick.emit(payload);

    // 2. Broadcast via Singleton Bus to Sibling Topology Widget (Adjacent Sibling -> Sibling)
    this.telemetryBus.dispatchAlarmTriage(
      {
        id: alarmId,
        entity,
        severity: severity as any,
        message: payload.message,
        timestamp: new Date().toISOString(),
        ack: false
      },
      'FM_STATUS_WIDGET',
      'TOPOLOGY_SUMMARY_WIDGET'
    );
  }

  clearCrossSync(): void {
    this.telemetryBus.clearFocus('FM_STATUS_WIDGET');
  }
}
