import { Injectable, signal, computed, WritableSignal } from '@angular/core';
import { FaultAlarm } from '../models/fault.model';

export interface CrossMfeEvent {
  id: string;
  timestamp: string;
  direction: 'PARENT_TO_CHILD' | 'CHILD_TO_PARENT' | 'ADJACENT_SIBLING';
  sourceApp: string;
  targetApp: string;
  topic: string;
  payload: any;
}

// Global window store ensuring absolute signal singleton identity across independent Injectors
interface GlobalTelemetryStore {
  activeEntity: WritableSignal<string | null>;
  activeCluster: WritableSignal<string>;
  activeAlarm: WritableSignal<FaultAlarm | null>;
  eventAuditLog: WritableSignal<CrossMfeEvent[]>;
}

function getOrCreateGlobalStore(): GlobalTelemetryStore {
  const win = typeof window !== 'undefined' ? (window as any) : {};
  if (!win.__MFE_GLOBAL_TELEMETRY__) {
    win.__MFE_GLOBAL_TELEMETRY__ = {
      activeEntity: signal<string | null>(null),
      activeCluster: signal<string>('cluster-core-east'),
      activeAlarm: signal<FaultAlarm | null>(null),
      eventAuditLog: signal<CrossMfeEvent[]>([])
    };
  }
  return win.__MFE_GLOBAL_TELEMETRY__;
}

@Injectable({
  providedIn: 'root'
})
export class TelemetryBusService {
  private readonly store = getOrCreateGlobalStore();

  readonly activeEntity = this.store.activeEntity;
  readonly activeCluster = this.store.activeCluster;
  readonly activeAlarm = this.store.activeAlarm;
  readonly eventAuditLog = this.store.eventAuditLog;

  readonly hasActiveFocus = computed(() => !!this.activeEntity());
  readonly recentEvents = computed(() => this.eventAuditLog().slice(-6));

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('mfe:cross-telemetry', ((e: CustomEvent) => {
        if (e.detail && e.detail.topic) {
          this.logEvent(
            e.detail.direction || 'ADJACENT_SIBLING',
            e.detail.sourceApp || 'EXTERNAL_WIDGET',
            e.detail.targetApp || 'ALL',
            e.detail.topic,
            e.detail.payload
          );
        }
      }) as EventListener);
    }
  }

  selectEntity(entityId: string, source: string, target = 'ALL'): void {
    this.activeEntity.set(entityId);
    this.logEvent(
      source === 'HOST_SHELL' ? 'PARENT_TO_CHILD' : 'ADJACENT_SIBLING',
      source,
      target,
      'ENTITY_SELECTED',
      { entityId }
    );
  }

  selectCluster(clusterId: string, source: string, target = 'ALL'): void {
    this.activeCluster.set(clusterId);
    this.logEvent(
      source === 'HOST_SHELL' ? 'PARENT_TO_CHILD' : 'ADJACENT_SIBLING',
      source,
      target,
      'CLUSTER_CHANGED',
      { clusterId }
    );
  }

  dispatchAlarmTriage(alarm: FaultAlarm, source: string, target = 'TOPOLOGY_MFE'): void {
    this.activeAlarm.set(alarm);
    this.activeEntity.set(alarm.entity);
    this.logEvent(
      source === 'HOST_SHELL' ? 'PARENT_TO_CHILD' : 'ADJACENT_SIBLING',
      source,
      target,
      'ALARM_TRIAGE_DISPATCHED',
      { alarmId: alarm.id, entity: alarm.entity, severity: alarm.severity }
    );
  }

  clearFocus(source = 'HOST_SHELL'): void {
    this.activeEntity.set(null);
    this.activeAlarm.set(null);
    this.logEvent(
      source === 'HOST_SHELL' ? 'PARENT_TO_CHILD' : 'CHILD_TO_PARENT',
      source,
      'ALL',
      'FOCUS_CLEARED',
      {}
    );
  }

  private logEvent(
    direction: CrossMfeEvent['direction'],
    sourceApp: string,
    targetApp: string,
    topic: string,
    payload: any
  ): void {
    const event: CrossMfeEvent = {
      id: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString(),
      direction,
      sourceApp,
      targetApp,
      topic,
      payload
    };

    this.eventAuditLog.update(prev => [...prev, event]);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('mfe:cross-telemetry-broadcast', { detail: event })
      );
    }
  }
}
