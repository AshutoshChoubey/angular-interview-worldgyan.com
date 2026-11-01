import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, SettingsService, TelemetryBusService, TopologyCluster, TopologyNode } from '@shared/core';

@Component({
  selector: 'app-topology-manager-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mfe-container">
      <div class="mfe-header">
        <div>
          <h2>Global Topology & Infrastructure Clusters</h2>
          <p class="subtitle">Theme Context: <strong>{{ settingsService.theme() }}</strong> | Language: <strong>{{ settingsService.language() }}</strong></p>
        </div>
      </div>

      <!-- Adjacent Cross-MFE Alert Notice -->
      @if (telemetryBus.activeEntity(); as activeEnt) {
        <div class="adjacent-alert-card">
          <div class="cross-info">
            <span class="pulse-icon">🚨</span>
            <span>Adjacent Fault MFE Telemetry: Entity <strong>{{ activeEnt }}</strong> has active alarm investigations!</span>
          </div>
          <button class="btn-clear-focus" (click)="telemetryBus.clearFocus('TOPOLOGY_MFE')">Reset Focus</button>
        </div>
      }

      <div class="clusters-grid">
        @for (cluster of clusters(); track cluster.clusterId) {
          <div
            class="cluster-card"
            [class.selected]="selectedClusterId() === cluster.clusterId"
            (click)="selectCluster(cluster.clusterId)">
            <div class="cluster-title">
              <h3>{{ cluster.name }}</h3>
              <span class="status-dot" [attr.data-status]="cluster.healthStatus"></span>
            </div>
            <div class="metric-row"><span>Region:</span><span class="val">{{ cluster.region }}</span></div>
            <div class="metric-row"><span>Nodes:</span><span class="val">{{ cluster.activeNodes }} / {{ cluster.totalNodes }}</span></div>
            <div class="metric-row"><span>Throughput:</span><span class="val">{{ cluster.throughputGbps }} Gbps</span></div>
          </div>
        }
      </div>

      <div class="nodes-card">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h3>Attached Nodes: {{ selectedClusterId() }}</h3>
          <span class="info-note">Click node to sync with Fault Management MFE</span>
        </div>

        <div class="nodes-grid">
          @for (node of nodes(); track node.id) {
            <div
              class="node-item"
              [class.node-alert]="isNodeFocused(node)"
              (click)="focusNodeCrossMfe(node)">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong>{{ node.id }}</strong>
                <span class="status-pill" [class.alert]="isNodeFocused(node)">
                  {{ isNodeFocused(node) ? '🚨 ALARM ACTIVE' : node.status }}
                </span>
              </div>
              <div class="details">
                <div>IP: {{ node.ip }} | Role: {{ node.role }}</div>
                <div>CPU: {{ node.cpuLoad }}% | MEM: {{ node.memoryUsed }}%</div>
              </div>
              <button class="btn-link-faults" (click)="navigateToFaults(node, $event)">
                Inspect in Fault MFE ➜
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mfe-container { max-width: 1440px; margin: 2rem auto; padding: 0 1.5rem; }
    .mfe-header { margin-bottom: 1.25rem; }
    .subtitle { font-size: 0.85rem; color: #9ca3af; }
    .adjacent-alert-card { background: rgba(239, 68, 68, 0.12); border: 1px solid #ef4444; border-radius: 8px; padding: 0.75rem 1rem; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; color: #ef4444; font-size: 0.85rem; }
    .cross-info { display: flex; align-items: center; gap: 0.5rem; }
    .btn-clear-focus { background: #ef4444; color: #fff; border: none; padding: 0.3rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; cursor: pointer; }
    .clusters-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem; margin-bottom: 2rem; }
    .cluster-card { background: #111827; border: 1px solid #374151; border-radius: 10px; padding: 1.25rem; cursor: pointer; transition: all 0.15s; }
    .cluster-card.selected { border-color: #38bdf8; background: #1f2937; }
    .cluster-title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
    .status-dot { width: 10px; height: 10px; border-radius: 50%; }
    .status-dot[data-status='HEALTHY'] { background: #10b981; }
    .status-dot[data-status='DEGRADED'] { background: #f59e0b; }
    .metric-row { display: flex; justify-content: space-between; font-size: 0.825rem; margin-top: 0.35rem; color: #9ca3af; }
    .metric-row .val { color: #fff; font-family: monospace; font-weight: 600; }
    .nodes-card { background: #111827; border: 1px solid #374151; border-radius: 10px; padding: 1.5rem; }
    .info-note { font-size: 0.75rem; color: #9ca3af; }
    .nodes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; margin-top: 1rem; }
    .node-item { background: #090d16; border: 1px solid #374151; border-radius: 8px; padding: 0.85rem; cursor: pointer; transition: border-color 0.15s; }
    .node-item:hover { border-color: #38bdf8; }
    .node-item.node-alert { border-color: #ef4444; background: rgba(239, 68, 68, 0.08); }
    .status-pill { font-size: 0.7rem; font-weight: 800; color: #10b981; }
    .status-pill.alert { color: #ef4444; }
    .details { font-size: 0.75rem; color: #9ca3af; margin: 0.5rem 0; font-family: monospace; }
    .btn-link-faults { width: 100%; background: #1f2937; border: 1px solid #374151; color: #38bdf8; padding: 0.35rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; cursor: pointer; }
    .btn-link-faults:hover { background: #38bdf8; color: #000; }
  `]
})
export class TopologyManagerRootComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly authService = inject(AuthService);
  readonly settingsService = inject(SettingsService);
  readonly telemetryBus = inject(TelemetryBusService);

  readonly clusters = signal<TopologyCluster[]>([]);
  readonly nodes = signal<TopologyNode[]>([]);
  readonly selectedClusterId = signal('cluster-core-east');

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['clusterId']) {
        this.selectedClusterId.set(params['clusterId']);
      }
      if (params['entity']) {
        this.telemetryBus.selectEntity(params['entity'], 'ROUTE_QUERY_PARAM');
      }
    });

    this.http.get<TopologyCluster[]>('http://localhost:3000/api/topology/clusters').subscribe({
      next: (data) => {
        this.clusters.set(data);
        if (data.length > 0) this.selectCluster(this.selectedClusterId());
      }
    });
  }

  isNodeFocused(node: TopologyNode): boolean {
    const active = this.telemetryBus.activeEntity();
    if (!active) return false;
    return active.includes(node.id) || (node.role === 'CORE_ROUTER' && active.includes('core-router'));
  }

  selectCluster(clusterId: string): void {
    this.selectedClusterId.set(clusterId);
    this.http.get<TopologyNode[]>(`http://localhost:3000/api/topology/nodes?clusterId=${clusterId}`).subscribe({
      next: (nodes) => this.nodes.set(nodes)
    });
  }

  focusNodeCrossMfe(node: TopologyNode): void {
    this.telemetryBus.selectEntity(node.id, 'TOPOLOGY_MFE', 'FAULT_MFE');
  }

  navigateToFaults(node: TopologyNode, event: Event): void {
    event.stopPropagation();
    this.telemetryBus.selectEntity(node.id, 'TOPOLOGY_MFE', 'FAULT_MFE');
    this.router.navigate(['/fault-management'], {
      queryParams: { entity: node.id }
    });
  }
}
