/**
 * @file 12-cross-mfe-communication-patterns.ts
 * @description Comprehensive Enterprise Patterns for Bidirectional Microfrontend Data Exchange
 * @framework Angular 22+ (Native Federation, Signals, Angular Elements)
 * 
 * Demonstrates 3 Core Communication Vectors:
 * 1. Parent ➜ Child: Host Shell to Remote / Custom Element via attribute & signal input bindings
 * 2. Child ➜ Parent: Remote / Custom Element to Host Shell via W3C Custom DOM Events & signal outputs
 * 3. Adjacent Sibling ⟷ Sibling: Sibling MFE to Sibling MFE via Native Federation Singleton Signal Store & Event Bus
 */

import { Injectable, Component, signal, computed, effect, input, output, inject } from '@angular/core';

// ============================================================================
// VECTOR 3: ADJACENT SIBLING-TO-SIBLING (Shared Singleton State Engine)
// ============================================================================

export interface CrossMfeEvent<T = any> {
  id: string;
  timestamp: string;
  direction: 'PARENT_TO_CHILD' | 'CHILD_TO_PARENT' | 'ADJACENT_SIBLING';
  sourceApp: string;
  targetApp: string;
  topic: string;
  payload: T;
}

/**
 * Singleton Telemetry Event Bus (@shared/core)
 * Shared via Native Federation (`singleton: true`).
 * Both sibling microfrontends consume the exact same memory instance.
 */
@Injectable({
  providedIn: 'root'
})
export class TelemetryBusService {
  // Reactive shared state signals
  readonly activeEntity = signal<string | null>(null);
  readonly activeCluster = signal<string>('cluster-core-east');
  readonly eventAuditLog = signal<CrossMfeEvent[]>([]);

  readonly hasActiveFocus = computed(() => !!this.activeEntity());

  /**
   * Sibling A (Fault MFE) calls this when an alarm is triggered.
   * Sibling B (Topology MFE) reads `activeEntity` reactively and highlights the affected node.
   */
  dispatchAlarmToTopology(entityId: string, alarmId: string, severity: string): void {
    this.activeEntity.set(entityId);
    this.emitAudit('ADJACENT_SIBLING', 'FAULT_MFE', 'TOPOLOGY_MFE', 'ALARM_DISPATCHED', {
      entityId,
      alarmId,
      severity
    });
  }

  /**
   * Sibling B (Topology MFE) calls this when an operator clicks a mesh node.
   * Sibling A (Fault MFE) reads `activeEntity` reactively and filters alarms for that node.
   */
  dispatchNodeToFaults(nodeId: string, clusterId: string): void {
    this.activeEntity.set(nodeId);
    this.activeCluster.set(clusterId);
    this.emitAudit('ADJACENT_SIBLING', 'TOPOLOGY_MFE', 'FAULT_MFE', 'NODE_SELECTED', {
      nodeId,
      clusterId
    });
  }

  clearFocus(source = 'HOST_SHELL'): void {
    this.activeEntity.set(null);
    this.emitAudit('PARENT_TO_CHILD', source, 'ALL', 'FOCUS_CLEARED', {});
  }

  private emitAudit(
    direction: CrossMfeEvent['direction'],
    sourceApp: string,
    targetApp: string,
    topic: string,
    payload: any
  ): void {
    const event: CrossMfeEvent = {
      id: `EVT-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      direction,
      sourceApp,
      targetApp,
      topic,
      payload
    };

    this.eventAuditLog.update(list => [...list, event]);

    // Mirror to native window for non-Angular decoupled observers
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mfe:cross-telemetry-broadcast', { detail: event }));
    }
  }
}

// ============================================================================
// VECTOR 1 & 2: PARENT-TO-CHILD & CHILD-TO-PARENT (Web Component Producer)
// ============================================================================

/**
 * Child Web Component Producer (<fm-status-widget>)
 * - Receives data DOWN from parent shell via `input()`
 * - Emits data UP to parent shell via `output()` (W3C CustomEvent)
 * - Synchronizes with sibling Topology widget via `TelemetryBusService`
 */
@Component({
  selector: 'app-fm-status-widget-impl',
  standalone: true,
  template: `
    <div class="widget-box" [attr.data-theme]="theme()">
      <h4>Alarms Triage Widget</h4>
      
      <!-- Sibling Synced Entity Notice -->
      @if (telemetryBus.activeEntity(); as entity) {
        <div class="sync-pill">Adjacent Synced Node: {{ entity }}</div>
      }

      <button (click)="onCriticalAlertClick()">
        Dispatch Critical Alarm on core-router-01
      </button>
    </div>
  `
})
export class FmStatusWidgetComponent {
  readonly telemetryBus = inject(TelemetryBusService);

  // Vector 1: Input from Parent Host Shell (Parent -> Child)
  readonly theme = input<'light' | 'dark'>('dark');
  readonly severityFilter = input<string>('ALL');

  // Vector 2: Output to Parent Host Shell (Child -> Parent)
  readonly alertClick = output<{ alarmId: string; entity: string; severity: string }>();

  onCriticalAlertClick(): void {
    const payload = {
      alarmId: 'ALM-8012',
      entity: 'core-router-01.us-east',
      severity: 'CRITICAL'
    };

    // Vector 2: Emit up to Parent Shell
    this.alertClick.emit(payload);

    // Vector 3: Emit to Adjacent Sibling via Shared Singleton
    this.telemetryBus.dispatchAlarmToTopology(payload.entity, payload.alarmId, payload.severity);
  }
}

// ============================================================================
// HOST SHELL CONSUMER & ORCHESTRATOR
// ============================================================================

/**
 * Host Shell Parent Component
 * - Injects data DOWN into Child Widgets (`[attr.theme]`, `[attr.selected-entity]`)
 * - Captures events UP from Child Widgets (`(alertClick)="handleChildAlert($event)"`)
 * - Monitors Sibling-to-Sibling Event Audit Trail
 */
@Component({
  selector: 'app-host-shell-orchestrator',
  standalone: true,
  template: `
    <!-- Parent-to-Child Downward Controls -->
    <button (click)="parentOverrideEntity('switch-spine-04.us-east')">
      Parent Override: Highlight switch-spine-04
    </button>

    <!-- Child-to-Parent Event Notification Banner -->
    <div class="banner">{{ lastChildEvent() }}</div>

    <!-- Children Embedded Web Components -->
    <fm-status-widget
      [attr.theme]="shellTheme()"
      [attr.selected-entity]="parentEntity()"
      (alertClick)="handleChildAlert($event)">
    </fm-status-widget>

    <topology-summary-widget
      [attr.theme]="shellTheme()"
      [attr.highlight-entity]="parentEntity()">
    </topology-summary-widget>
  `
})
export class HostShellOrchestratorComponent {
  readonly telemetryBus = inject(TelemetryBusService);

  readonly shellTheme = signal<'light' | 'dark'>('dark');
  readonly parentEntity = signal<string | null>(null);
  readonly lastChildEvent = signal<string>('Listening for events...');

  // Vector 1: Parent -> Child
  parentOverrideEntity(entity: string): void {
    this.parentEntity.set(entity);
    this.telemetryBus.clearFocus('HOST_SHELL');
  }

  // Vector 2: Child -> Parent
  handleChildAlert(event: any): void {
    const detail = event.detail || event;
    this.lastChildEvent.set(`Captured from Child: ${detail.alarmId} on ${detail.entity}`);
  }
}

