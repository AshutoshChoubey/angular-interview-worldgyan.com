import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService, SettingsService, TopologyCluster, TopologyNode } from '@shared/core';

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

      <div class="clusters-grid">
        @for (cluster of clusters(); track cluster.clusterId) {
          <div class="cluster-card" [class.selected]="selectedClusterId() === cluster.clusterId" (click)="selectCluster(cluster.clusterId)">
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
        <h3>Attached Nodes: {{ selectedClusterId() }}</h3>
        <div class="nodes-grid">
          @for (node of nodes(); track node.id) {
            <div class="node-item">
              <div style="display:flex; justify-content:space-between;">
                <strong>{{ node.id }}</strong>
                <span class="status-pill">{{ node.status }}</span>
              </div>
              <div class="details">IP: {{ node.ip }} | Role: {{ node.role }}</div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mfe-container { max-width: 1440px; margin: 2rem auto; padding: 0 1.5rem; }
    .mfe-header { margin-bottom: 1.5rem; }
    .subtitle { font-size: 0.85rem; color: #9ca3af; }
    .clusters-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem; margin-bottom: 2rem; }
    .cluster-card { background: #111827; border: 1px solid #374151; border-radius: 10px; padding: 1.25rem; cursor: pointer; }
    .cluster-card.selected { border-color: #38bdf8; background: #1f2937; }
    .cluster-title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
    .status-dot { width: 10px; height: 10px; border-radius: 50%; }
    .status-dot[data-status='HEALTHY'] { background: #10b981; }
    .status-dot[data-status='DEGRADED'] { background: #f59e0b; }
    .metric-row { display: flex; justify-content: space-between; font-size: 0.825rem; margin-top: 0.35rem; color: #9ca3af; }
    .metric-row .val { color: #fff; font-family: monospace; font-weight: 600; }
    .nodes-card { background: #111827; border: 1px solid #374151; border-radius: 10px; padding: 1.5rem; }
    .nodes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; margin-top: 1rem; }
    .node-item { background: #090d16; border: 1px solid #374151; border-radius: 8px; padding: 0.85rem; }
    .status-pill { font-size: 0.7rem; font-weight: 800; color: #10b981; }
    .details { font-size: 0.75rem; color: #9ca3af; margin-top: 0.5rem; font-family: monospace; }
  `]
})
export class TopologyManagerRootComponent implements OnInit {
  private readonly http = inject(HttpClient);
  readonly authService = inject(AuthService);
  readonly settingsService = inject(SettingsService);

  readonly clusters = signal<TopologyCluster[]>([]);
  readonly nodes = signal<TopologyNode[]>([]);
  readonly selectedClusterId = signal('cluster-core-east');

  ngOnInit(): void {
    this.http.get<TopologyCluster[]>('http://localhost:3000/api/topology/clusters').subscribe({
      next: (data) => {
        this.clusters.set(data);
        if (data.length > 0) this.selectCluster(data[0].clusterId);
      }
    });
  }

  selectCluster(clusterId: string): void {
    this.selectedClusterId.set(clusterId);
    this.http.get<TopologyNode[]>(`http://localhost:3000/api/topology/nodes?clusterId=${clusterId}`).subscribe({
      next: (nodes) => this.nodes.set(nodes)
    });
  }
}
