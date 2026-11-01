import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, SettingsService, TelemetryBusService, FaultAlarm } from '@shared/core';

@Component({
  selector: 'app-fault-management-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mfe-container">
      <div class="mfe-header">
        <div>
          <h2>Fault Management Operations</h2>
          <p class="subtitle">
            Shared Context: Theme = <strong>{{ settingsService.theme() }}</strong> | 
            Operator = <strong>{{ authService.user()?.fullName }}</strong>
          </p>
        </div>

        <div class="filter-group">
          @for (filter of filterOptions; track filter) {
            <button
              [class.active]="selectedSeverity() === filter"
              (click)="setFilter(filter)"
              class="filter-pill">
              {{ filter }}
            </button>
          }
        </div>
      </div>

      <!-- Adjacent Cross-MFE Sync Notice -->
      @if (telemetryBus.activeEntity(); as activeEnt) {
        <div class="adjacent-cross-card">
          <div class="cross-info">
            <span class="icon">⟷</span>
            <span>Adjacent Topology Sync Active: Alarms focused on entity <strong>{{ activeEnt }}</strong></span>
          </div>
          <button class="btn-clear-focus" (click)="telemetryBus.clearFocus('FAULT_MFE')">Show All Alarms</button>
        </div>
      }

      <div class="table-card">
        <table class="faults-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Severity</th>
              <th>Entity</th>
              <th>Message</th>
              <th>Time</th>
              <th>Status</th>
              <th>Cross-MFE Action</th>
            </tr>
          </thead>
          <tbody>
            @for (fault of filteredFaults(); track fault.id) {
              <tr [class.highlighted-row]="fault.entity === telemetryBus.activeEntity()">
                <td class="font-mono">{{ fault.id }}</td>
                <td><span class="severity-badge" [attr.data-sev]="fault.severity">{{ fault.severity }}</span></td>
                <td class="font-mono">{{ fault.entity }}</td>
                <td>{{ fault.message }}</td>
                <td>{{ fault.timestamp | date:'shortTime' }}</td>
                <td><span class="status-indicator" [class.ack]="fault.ack">{{ fault.ack ? 'ACKNOWLEDGED' : 'ACTIVE' }}</span></td>
                <td>
                  <button class="btn-inspect" (click)="inspectInTopologyMfe(fault)">
                    Inspect in Topology MFE ➜
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" style="text-align:center; padding: 2rem; color: #9ca3af;">
                  No alarms matching criteria.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .mfe-container { max-width: 1440px; margin: 2rem auto; padding: 0 1.5rem; }
    .mfe-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 1rem; }
    .subtitle { font-size: 0.85rem; color: #9ca3af; }
    .filter-group { display: flex; gap: 0.5rem; }
    .filter-pill { background: #111827; border: 1px solid #374151; color: #9ca3af; padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer; }
    .filter-pill.active { background: #38bdf8; color: #000; border-color: #38bdf8; }
    .adjacent-cross-card { background: rgba(245, 158, 11, 0.12); border: 1px solid #f59e0b; border-radius: 8px; padding: 0.75rem 1rem; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; color: #f59e0b; font-size: 0.85rem; }
    .cross-info { display: flex; align-items: center; gap: 0.5rem; }
    .btn-clear-focus { background: #f59e0b; color: #000; border: none; padding: 0.3rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; cursor: pointer; }
    .table-card { background: #111827; border: 1px solid #374151; border-radius: 10px; overflow: hidden; }
    .faults-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .faults-table th, .faults-table td { padding: 0.85rem 1.25rem; border-bottom: 1px solid #374151; }
    .faults-table th { background: #1f2937; color: #9ca3af; font-weight: 700; text-align: left; }
    .highlighted-row { background: rgba(56, 189, 248, 0.08); }
    .severity-badge { display: inline-block; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 800; }
    .severity-badge[data-sev='CRITICAL'] { background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid #ef4444; }
    .severity-badge[data-sev='MAJOR'] { background: rgba(245, 158, 11, 0.2); color: #f59e0b; border: 1px solid #f59e0b; }
    .severity-badge[data-sev='MINOR'] { background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid #38bdf8; }
    .status-indicator { font-size: 0.75rem; font-weight: 700; color: #ef4444; }
    .status-indicator.ack { color: #10b981; }
    .btn-inspect { background: #1f2937; border: 1px solid #374151; color: #38bdf8; padding: 0.3rem 0.6rem; border-radius: 4px; font-size: 0.75rem; cursor: pointer; font-weight: 600; }
    .btn-inspect:hover { background: #38bdf8; color: #000; }
    .font-mono { font-family: monospace; }
  `]
})
export class FaultManagementRootComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly authService = inject(AuthService);
  readonly settingsService = inject(SettingsService);
  readonly telemetryBus = inject(TelemetryBusService);

  readonly filterOptions = ['ALL', 'CRITICAL', 'MAJOR', 'MINOR'];
  readonly selectedSeverity = signal('ALL');
  readonly faults = signal<FaultAlarm[]>([]);

  readonly filteredFaults = () => {
    const list = this.faults();
    const activeFocus = this.telemetryBus.activeEntity();
    if (activeFocus) {
      const match = list.filter(f => f.entity === activeFocus);
      return match.length > 0 ? match : list;
    }
    return list;
  };

  ngOnInit(): void {
    // Read query parameter if navigated with entity focus
    this.route.queryParams.subscribe(params => {
      if (params['entity']) {
        this.telemetryBus.selectEntity(params['entity'], 'ROUTE_QUERY_PARAM');
      }
    });

    this.fetchFaults();
  }

  setFilter(severity: string): void {
    this.selectedSeverity.set(severity);
    this.fetchFaults();
  }

  inspectInTopologyMfe(alarm: FaultAlarm): void {
    // 1. Update shared singleton state
    this.telemetryBus.dispatchAlarmTriage(alarm, 'FAULT_MANAGEMENT_MFE', 'TOPOLOGY_MANAGER_MFE');

    // 2. Cross-route to adjacent MFE with query parameters
    this.router.navigate(['/topology'], {
      queryParams: {
        clusterId: 'cluster-core-east',
        entity: alarm.entity,
        alarmId: alarm.id
      }
    });
  }

  private fetchFaults(): void {
    const param = this.selectedSeverity() !== 'ALL' ? `?severity=${this.selectedSeverity()}` : '';
    this.http.get<FaultAlarm[]>(`http://localhost:3000/api/faults${param}`).subscribe({
      next: (data) => this.faults.set(data),
      error: (err) => console.error(err)
    });
  }
}
