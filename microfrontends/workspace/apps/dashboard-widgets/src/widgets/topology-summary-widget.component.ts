import { Component, input, output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TelemetryBusService } from '@shared/core';

@Component({
  selector: 'app-topology-summary-widget-impl',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="widget-box" [attr.data-theme]="theme()">
      <div class="widget-header">
        <div>
          <h4>Topology Mesh Status</h4>
          <span class="mfe-badge">Child Widget MFE 2</span>
        </div>
        <span class="cluster-badge">{{ currentCluster() }}</span>
      </div>

      <!-- Adjacent Sibling Alert Banner -->
      @if (telemetryBus.activeAlarm(); as alarm) {
        <div class="alarm-banner">
          <span class="blink-dot"></span>
          <span>Adjacent Fault Alert on <strong>{{ alarm.entity }}</strong> ({{ alarm.severity }})</span>
        </div>
      }

      <div class="metrics-grid">
        <div class="metric-item">
          <span class="val">98.4%</span>
          <span class="desc">Mesh Reliability</span>
        </div>
        <div class="metric-item">
          <span class="val">340 Gbps</span>
          <span class="desc">Fabric Load</span>
        </div>
      </div>

      <div class="nodes-list">
        <!-- Node 1: core-router-01 -->
        <div
          class="node-pill"
          [class.highlighted]="isNodeHighlighted('core-router-01.us-east')"
          (click)="selectNode('node-ce-01', '10.240.12.1', 'ONLINE', 'core-router-01.us-east')">
          <div class="node-left">
            <span class="node-title">node-ce-01 (core-router-01)</span>
            @if (isNodeHighlighted('core-router-01.us-east')) {
              <span class="cross-badge">🚨 Target of Fault Alarm</span>
            }
          </div>
          <span class="status online">ONLINE</span>
        </div>

        <!-- Node 2: switch-spine-04 -->
        <div
          class="node-pill"
          [class.highlighted]="isNodeHighlighted('switch-spine-04.us-east')"
          (click)="selectNode('node-ce-02', '10.240.12.2', 'DEGRADED', 'switch-spine-04.us-east')">
          <div class="node-left">
            <span class="node-title">node-ce-02 (switch-spine-04)</span>
            @if (isNodeHighlighted('switch-spine-04.us-east')) {
              <span class="cross-badge">⚠️ Target of Fault Alarm</span>
            }
          </div>
          <span class="status degraded">DEGRADED</span>
        </div>

        <!-- Node 3: edge-gateway-02 -->
        <div
          class="node-pill"
          [class.highlighted]="isNodeHighlighted('edge-gateway-02.eu-west')"
          (click)="selectNode('node-eu-01', '10.180.4.1', 'ONLINE', 'edge-gateway-02.eu-west')">
          <div class="node-left">
            <span class="node-title">node-eu-01 (edge-gateway-02)</span>
            @if (isNodeHighlighted('edge-gateway-02.eu-west')) {
              <span class="cross-badge">⚡ Target of Fault Alarm</span>
            }
          </div>
          <span class="status online">ONLINE</span>
        </div>
      </div>

      <div class="footer-hint">
        Click node to notify parent shell & adjacent Fault widget
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
    .cluster-badge { font-size: 0.75rem; font-family: monospace; background: rgba(59, 130, 246, 0.2); color: #60a5fa; padding: 0.2rem 0.5rem; border-radius: 4px; }
    .alarm-banner { background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; border-radius: 6px; padding: 0.4rem 0.75rem; font-size: 0.75rem; color: #ef4444; margin-bottom: 0.85rem; display: flex; align-items: center; gap: 0.5rem; animation: pulse 2s infinite; }
    .blink-dot { width: 8px; height: 8px; border-radius: 50%; background: #ef4444; }
    @keyframes pulse { 0% { opacity: 0.8; } 50% { opacity: 1; } 100% { opacity: 0.8; } }
    .metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem; }
    .metric-item { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); padding: 0.65rem; border-radius: 6px; }
    .val { display: block; font-size: 1.25rem; font-weight: 800; color: #10b981; }
    .desc { font-size: 0.75rem; color: #9ca3af; }
    .nodes-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .node-pill { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.75rem; background: rgba(0,0,0,0.2); border: 1px solid transparent; border-radius: 6px; font-size: 0.8rem; cursor: pointer; transition: all 0.15s; }
    .node-pill:hover { background: rgba(59, 130, 246, 0.15); }
    .node-pill.highlighted { border-color: #ef4444; background: rgba(239, 68, 68, 0.15); }
    .node-left { display: flex; flex-direction: column; gap: 2px; }
    .node-title { font-weight: 600; }
    .cross-badge { font-size: 0.68rem; color: #ef4444; font-weight: 700; }
    .status { font-size: 0.7rem; font-weight: 800; }
    .status.online { color: #10b981; }
    .status.degraded { color: #f59e0b; }
    .footer-hint { font-size: 0.7rem; color: #9ca3af; margin-top: 0.75rem; text-align: center; }
  `]
})
export class TopologySummaryWidgetComponent {
  readonly telemetryBus = inject(TelemetryBusService);

  // Vector 1: Inputs from Parent Host Shell
  readonly theme = input<'light' | 'dark'>('dark');
  readonly clusterId = input<string>('cluster-core-east', { alias: 'cluster-id' });
  readonly highlightEntity = input<string | null>(null, { alias: 'highlight-entity' });

  readonly currentCluster = computed(() => this.clusterId() || this.telemetryBus.activeCluster());

  // Vector 2: Output to Parent Host Shell
  readonly nodeSelect = output<{ nodeId: string; ip: string; status: string; entity: string }>();

  isNodeHighlighted(entityId: string): boolean {
    const fromParent = this.highlightEntity();
    const fromBus = this.telemetryBus.activeEntity();
    return fromParent === entityId || fromBus === entityId;
  }

  selectNode(nodeId: string, ip: string, status: string, entity: string): void {
    const payload = { nodeId, ip, status, entity };

    // 1. Emit to Parent Shell (Child -> Parent)
    this.nodeSelect.emit(payload);

    // 2. Broadcast via Singleton Bus to Sibling Fault Widget (Adjacent Sibling -> Sibling)
    this.telemetryBus.selectEntity(entity, 'TOPOLOGY_SUMMARY_WIDGET', 'FM_STATUS_WIDGET');
  }
}
