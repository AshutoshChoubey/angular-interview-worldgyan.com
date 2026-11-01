/**
 * @file 08-remote-topology-manager.ts
 * @description Remote Microfrontend 2: Topology Manager & Mesh Clusters (Port 4202)
 * @framework Angular 22+ (Native Federation Remote, Signals, Modern Control Flow)
 */

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Routes } from '@angular/router';
import { AuthService, SettingsService, TopologyCluster, TopologyNode } from '@shared/core';

@Component({
  selector: 'app-topology-manager-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="topology-container">
      <div class="page-header">
        <div>
          <h2>Global Topology & Infrastructure Clusters</h2>
          <p class="subtitle">
            Shared Engine Context: Active Theme = <strong>{{ settingsService.theme() }}</strong> |
            Language = <strong>{{ settingsService.language() }}</strong>
          </p>
        </div>
      </div>

      <!-- Infrastructure Clusters Cards -->
      <div class="clusters-grid">
        @for (cluster of clusters(); track cluster.clusterId) {
          <div
            class="cluster-card"
            [class.selected]="selectedClusterId() === cluster.clusterId"
            (click)="onClusterClick(cluster.clusterId)">
            <div class="cluster-header">
              <h3>{{ cluster.name }}</h3>
              <span class="health-indicator" [attr.data-health]="cluster.healthStatus"></span>
            </div>
            <div class="metric-row">
              <span class="label">Region:</span>
              <span class="val font-mono">{{ cluster.region }}</span>
            </div>
            <div class="metric-row">
              <span class="label">Healthy Nodes:</span>
              <span class="val font-mono">{{ cluster.activeNodes }} / {{ cluster.totalNodes }} ({{ cluster.healthyPercentage }}%)</span>
            </div>
            <div class="metric-row">
              <span class="label">Throughput:</span>
              <span class="val font-mono">{{ cluster.throughputGbps }} Gbps</span>
            </div>
          </div>
        }
      </div>

      <!-- Attached Mesh Nodes Matrix -->
      <div class="nodes-panel">
        <h3 class="panel-title">Attached Compute & Switch Nodes: <code>{{ selectedClusterId() }}</code></h3>
        <div class="nodes-grid">
          @for (node of nodes(); track node.id) {
            <div class="node-badge">
              <div class="node-top">
                <span class="node-id font-mono">{{ node.id }}</span>
                <span class="node-status" [attr.data-status]="node.status">{{ node.status }}</span>
              </div>
              <div class="node-specs font-mono">
                <div>IP: {{ node.ip }}</div>
                <div>Role: {{ node.role }}</div>
                <div>CPU: {{ node.cpuLoad }}% | MEM: {{ node.memoryUsed }}%</div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .topology-container { max-width: 1440px; margin: 2rem auto; padding: 0 1.5rem; }
    .page-header { margin-bottom: 1.5rem; }
    .subtitle { font-size: 0.85rem; color: var(--text-secondary, #9ca3af); }
    .clusters-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem; margin-bottom: 2rem; }
    .cluster-card {
      background: var(--bg-surface, #111827);
      border: 1px solid var(--border-subtle, #374151);
      border-radius: 10px;
      padding: 1.25rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .cluster-card:hover { border-color: var(--accent-cyan, #38bdf8); }
    .cluster-card.selected { border-color: var(--accent-cyan, #38bdf8); background: var(--bg-surface-elevated, #1f2937); }
    .cluster-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
    .cluster-header h3 { font-size: 1.05rem; font-weight: 700; }
    .health-indicator { width: 10px; height: 10px; border-radius: 50%; }
    .health-indicator[data-health='HEALTHY'] { background: #10b981; }
    .health-indicator[data-health='DEGRADED'] { background: #f59e0b; }
    .health-indicator[data-health='CRITICAL'] { background: #ef4444; }
    .metric-row { display: flex; justify-content: space-between; font-size: 0.825rem; margin-top: 0.35rem; }
    .metric-row .label { color: var(--text-secondary, #9ca3af); }
    .metric-row .val { font-weight: 600; }
    .nodes-panel {
      background: var(--bg-surface, #111827);
      border: 1px solid var(--border-subtle, #374151);
      border-radius: 10px;
      padding: 1.5rem;
    }
    .panel-title { margin-bottom: 1.25rem; font-size: 1.1rem; }
    .nodes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; }
    .node-badge {
      background: var(--bg-core, #090d16);
      border: 1px solid var(--border-subtle, #374151);
      border-radius: 8px;
      padding: 0.85rem;
    }
    .node-top { display: flex; justify-content: space-between; align-items: center; }
    .node-id { font-weight: 700; font-size: 0.85rem; }
    .node-status { font-size: 0.7rem; font-weight: 800; padding: 0.15rem 0.4rem; border-radius: 4px; }
    .node-status[data-status='ONLINE'] { color: #10b981; background: rgba(16, 185, 129, 0.15); }
    .node-status[data-status='DEGRADED'] { color: #f59e0b; background: rgba(245, 158, 11, 0.15); }
    .node-specs { font-size: 0.75rem; color: var(--text-secondary, #9ca3af); margin-top: 0.5rem; line-height: 1.4; }
    .font-mono { font-family: monospace; }
  `]
})
export class TopologyManagerRootComponent implements OnInit {
  private readonly http = inject(HttpClient);
  readonly authService = inject(AuthService);
  readonly settingsService = inject(SettingsService);

  readonly clusters = signal<TopologyCluster[]>([]);
  readonly nodes = signal<TopologyNode[]>([]);
  readonly selectedClusterId = signal<string>('cluster-core-east');

  ngOnInit(): void {
    this.http.get<TopologyCluster[]>('http://localhost:3000/api/topology/clusters').subscribe({
      next: (data) => {
        this.clusters.set(data);
        if (data.length > 0) {
          this.onClusterClick(data[0].clusterId);
        }
      }
    });
  }

  onClusterClick(clusterId: string): void {
    this.selectedClusterId.set(clusterId);
    this.http.get<TopologyNode[]>(`http://localhost:3000/api/topology/nodes?clusterId=${clusterId}`).subscribe({
      next: (nodes) => this.nodes.set(nodes)
    });
  }
}

/**
 * Exposed Module Entry Point for Native Federation
 */
export const TOPOLOGY_ROUTES: Routes = [
  {
    path: '',
    component: TopologyManagerRootComponent
  }
];
