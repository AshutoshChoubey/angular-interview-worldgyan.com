/**
 * @file 09-angular-elements-widgets.ts
 * @description Remote Web Component Producer via Angular Elements (Port 4203)
 * @framework Angular 22+ (@angular/elements, createCustomElement, Signal Inputs/Outputs)
 * 
 * Exposes native Custom Elements (<fm-status-widget> and <topology-summary-widget>)
 * that can be dynamically mounted into any DOM tree, Angular shell, React host, or vanilla HTML.
 */

import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';

/**
 * ------------------------------------------------------------------
 * 1. Angular Standalone Component: Fault Management Status Widget
 * ------------------------------------------------------------------
 */
@Component({
  selector: 'app-fm-status-widget-impl',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="widget-box" [attr.data-theme]="theme()">
      <div class="widget-header">
        <h4>Active Alarms Triage</h4>
        <span class="pulse-tag">Live Engine</span>
      </div>

      <div class="counters-row">
        <div class="counter-card critical" (click)="triggerAlert('CRITICAL')">
          <span class="count">02</span>
          <span class="label">Critical</span>
        </div>
        <div class="counter-card major" (click)="triggerAlert('MAJOR')">
          <span class="count">01</span>
          <span class="label">Major</span>
        </div>
        <div class="counter-card minor" (click)="triggerAlert('MINOR')">
          <span class="count">01</span>
          <span class="label">Minor</span>
        </div>
      </div>

      <div class="footer-note">
        Filter Applied: <code>{{ severityFilter() }}</code> • Click counter to emit DOM CustomEvent
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .widget-box {
      border: 1px solid #374151;
      background: #111827;
      color: #f9fafb;
      border-radius: 10px;
      padding: 1.25rem;
      transition: all 0.2s ease;
    }
    .widget-box[data-theme='light'] {
      border-color: #d1d5db;
      background: #ffffff;
      color: #111827;
    }
    .widget-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .widget-header h4 { margin: 0; font-size: 0.95rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
    .pulse-tag { font-size: 0.7rem; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 700; }
    .counters-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
    .counter-card {
      padding: 0.85rem;
      border-radius: 8px;
      text-align: center;
      cursor: pointer;
      transition: transform 0.15s ease;
    }
    .counter-card:hover { transform: translateY(-2px); }
    .counter-card.critical { background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #ef4444; }
    .counter-card.major { background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); color: #f59e0b; }
    .counter-card.minor { background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; }
    .count { display: block; font-size: 1.5rem; font-weight: 900; line-height: 1; margin-bottom: 0.35rem; }
    .label { font-size: 0.75rem; text-transform: uppercase; font-weight: 700; }
    .footer-note { font-size: 0.75rem; color: #9ca3af; margin-top: 1rem; }
    code { font-family: monospace; background: rgba(0,0,0,0.2); padding: 0.1rem 0.3rem; border-radius: 3px; }
  `]
})
export class FmStatusWidgetComponent {
  // Angular 22 Input Signals with automatic attribute change reflection
  readonly theme = input<'light' | 'dark'>('dark');
  readonly severityFilter = input<string>('ALL');

  // Modern Output Signal: Automatically transformed into standard DOM CustomEvent
  readonly alertClick = output<{ alarmId: string; severity: string; message: string }>();

  triggerAlert(severity: string): void {
    this.alertClick.emit({
      alarmId: `ALM-${Math.floor(1000 + Math.random() * 9000)}`,
      severity,
      message: `Fast-triage dispatch initiated for ${severity} alarm queue.`
    });
  }
}

/**
 * ------------------------------------------------------------------
 * 2. Angular Standalone Component: Topology Summary Widget
 * ------------------------------------------------------------------
 */
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
          <span>node-ce-02 (Core Router)</span>
          <span class="status degraded">DEGRADED</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .widget-box {
      border: 1px solid #374151;
      background: #111827;
      color: #f9fafb;
      border-radius: 10px;
      padding: 1.25rem;
      transition: all 0.2s ease;
    }
    .widget-box[data-theme='light'] {
      border-color: #d1d5db;
      background: #ffffff;
      color: #111827;
    }
    .widget-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .widget-header h4 { margin: 0; font-size: 0.95rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
    .cluster-badge { font-size: 0.75rem; font-family: monospace; background: rgba(59, 130, 246, 0.2); color: #60a5fa; padding: 0.2rem 0.5rem; border-radius: 4px; }
    .metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem; }
    .metric-item { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); padding: 0.75rem; border-radius: 6px; }
    .val { display: block; font-size: 1.25rem; font-weight: 800; color: #10b981; }
    .desc { font-size: 0.75rem; color: #9ca3af; }
    .nodes-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .node-pill {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0.75rem;
      background: rgba(0,0,0,0.2);
      border-radius: 6px;
      font-size: 0.8rem;
      cursor: pointer;
      transition: background 0.15s;
    }
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

/**
 * ------------------------------------------------------------------
 * 3. Bootstrap & Custom Elements Registration Routine
 * ------------------------------------------------------------------
 */
export async function bootstrapWebComponents(): Promise<void> {
  // Idempotency check: avoid double definition if re-imported
  if (customElements.get('fm-status-widget') && customElements.get('topology-summary-widget')) {
    return;
  }

  // Create lightweight headless ApplicationRef to provide Injector context
  const appRef = await createApplication({
    providers: []
  });

  // Define <fm-status-widget>
  if (!customElements.get('fm-status-widget')) {
    const fmElement = createCustomElement(FmStatusWidgetComponent, {
      injector: appRef.injector
    });
    customElements.define('fm-status-widget', fmElement);
  }

  // Define <topology-summary-widget>
  if (!customElements.get('topology-summary-widget')) {
    const topoElement = createCustomElement(TopologySummaryWidgetComponent, {
      injector: appRef.injector
    });
    customElements.define('topology-summary-widget', topoElement);
  }

  console.log('[Native Federation] Angular Elements registered in window.customElements');
}

// Auto-invoke upon remote evaluation
bootstrapWebComponents().catch(err => console.error('[Elements Boot Error]', err));

