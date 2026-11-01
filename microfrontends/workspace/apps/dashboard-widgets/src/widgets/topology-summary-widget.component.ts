import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-topology-summary-widget-impl',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="widget-box" [attr.data-theme]="theme()">
      <div class="widget-header">
        <h4>Topology Mesh Status</h4>
        <span class="cluster-badge">{{ clusterId() }}</span>
      </div>

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
        <div class="node-pill" (click)="selectNode('node-ce-01', '10.240.12.1', 'ONLINE')">
          <span>node-ce-01 (Spine)</span>
          <span class="status online">ONLINE</span>
        </div>
        <div class="node-pill" (click)="selectNode('node-ce-02', '10.240.12.2', 'DEGRADED')">
          <span>node-ce-02 (Core)</span>
          <span class="status degraded">DEGRADED</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .widget-box { border: 1px solid #374151; background: #111827; color: #f9fafb; border-radius: 10px; padding: 1.25rem; }
    .widget-box[data-theme='light'] { border-color: #d1d5db; background: #ffffff; color: #111827; }
    .widget-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .widget-header h4 { margin: 0; font-size: 0.95rem; font-weight: 700; text-transform: uppercase; }
    .cluster-badge { font-size: 0.75rem; font-family: monospace; background: rgba(59, 130, 246, 0.2); color: #60a5fa; padding: 0.2rem 0.5rem; border-radius: 4px; }
    .metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem; }
    .metric-item { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); padding: 0.75rem; border-radius: 6px; }
    .val { display: block; font-size: 1.25rem; font-weight: 800; color: #10b981; }
    .desc { font-size: 0.75rem; color: #9ca3af; }
    .nodes-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .node-pill { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.75rem; background: rgba(0,0,0,0.2); border-radius: 6px; font-size: 0.8rem; cursor: pointer; }
    .node-pill:hover { background: rgba(59, 130, 246, 0.15); }
    .status { font-size: 0.7rem; font-weight: 800; }
    .status.online { color: #10b981; }
    .status.degraded { color: #f59e0b; }
  `]
})
export class TopologySummaryWidgetComponent {
  readonly theme = input<'light' | 'dark'>('dark');
  readonly clusterId = input<string>('cluster-core-east');
  readonly nodeSelect = output<{ nodeId: string; ip: string; status: string }>();

  selectNode(nodeId: string, ip: string, status: string): void {
    this.nodeSelect.emit({ nodeId, ip, status });
  }
}

