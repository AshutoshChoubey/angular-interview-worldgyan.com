/**
 * @file 07-remote-fault-management.ts
 * @description Remote Microfrontend 1: Fault Management Operations (Port 4201)
 * @framework Angular 22+ (Native Federation Remote, Signals, Modern Control Flow)
 */

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Routes } from '@angular/router';
import { AuthService, SettingsService, FaultAlarm } from '@shared/core';

@Component({
  selector: 'app-fault-management-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="faults-container">
      <div class="page-header">
        <div>
          <h2>Mission-Critical Fault Management</h2>
          <p class="subtitle">
            Shared Singleton Context: Theme = <strong>{{ settingsService.theme() }}</strong> | 
            Operator = <strong>{{ authService.user()?.fullName ?? 'Anonymous' }}</strong>
          </p>
        </div>

        <!-- Severity Filter Navigation -->
        <div class="filters-bar">
          @for (sev of severityOptions; track sev) {
            <button
              [class.active]="activeSeverity() === sev"
              (click)="filterBySeverity(sev)"
              class="filter-btn">
              {{ sev }}
            </button>
          }
        </div>
      </div>

      <!-- Live Alarms Table -->
      <div class="table-wrapper">
        <table class="alarms-table">
          <thead>
            <tr>
              <th>Alarm ID</th>
              <th>Severity</th>
              <th>Network Entity</th>
              <th>Diagnostic Telemetry</th>
              <th>Raised Time</th>
              <th>Ack State</th>
            </tr>
          </thead>
          <tbody>
            @for (alarm of alarms(); track alarm.id) {
              <tr>
                <td class="font-mono">{{ alarm.id }}</td>
                <td>
                  <span class="severity-pill" [attr.data-sev]="alarm.severity">
                    {{ alarm.severity }}
                  </span>
                </td>
                <td class="font-mono">{{ alarm.entity }}</td>
                <td>{{ alarm.message }}</td>
                <td class="timestamp">{{ alarm.timestamp | date:'HH:mm:ss' }}</td>
                <td>
                  <span class="ack-status" [class.acknowledged]="alarm.ack">
                    {{ alarm.ack ? 'ACKNOWLEDGED' : 'ACTIVE' }}
                  </span>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="empty-state">No alarms currently matching severity filter.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
  styles: [`
    .faults-container { max-width: 1440px; margin: 2rem auto; padding: 0 1.5rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .subtitle { font-size: 0.85rem; color: var(--text-secondary, #9ca3af); }
    .filters-bar { display: flex; gap: 0.5rem; }
    .filter-btn {
      background: var(--bg-surface, #111827);
      border: 1px solid var(--border-subtle, #374151);
      color: var(--text-secondary, #9ca3af);
      padding: 0.4rem 0.85rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
    }
    .filter-btn.active {
      background: var(--accent-cyan, #38bdf8);
      color: #000;
      border-color: var(--accent-cyan, #38bdf8);
    }
    .table-wrapper {
      background: var(--bg-surface, #111827);
      border: 1px solid var(--border-subtle, #374151);
      border-radius: 10px;
      overflow: hidden;
    }
    .alarms-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.875rem; }
    .alarms-table th, .alarms-table td { padding: 0.85rem 1.25rem; border-bottom: 1px solid var(--border-subtle, #374151); }
    .alarms-table th { background: var(--bg-surface-elevated, #1f2937); color: var(--text-secondary, #9ca3af); font-weight: 700; }
    .severity-pill { display: inline-block; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 800; }
    .severity-pill[data-sev='CRITICAL'] { background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid #ef4444; }
    .severity-pill[data-sev='MAJOR'] { background: rgba(245, 158, 11, 0.2); color: #f59e0b; border: 1px solid #f59e0b; }
    .severity-pill[data-sev='MINOR'] { background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid #38bdf8; }
    .severity-pill[data-sev='WARNING'] { background: rgba(156, 163, 175, 0.2); color: #9ca3af; border: 1px solid #6b7280; }
    .ack-status { font-size: 0.75rem; font-weight: 800; color: #ef4444; }
    .ack-status.acknowledged { color: #10b981; }
    .font-mono { font-family: monospace; }
    .timestamp { color: var(--text-muted, #6b7280); font-family: monospace; }
    .empty-state { text-align: center; padding: 2.5rem; color: var(--text-muted, #6b7280); }
  `]
})
export class FaultManagementRootComponent implements OnInit {
  private readonly http = inject(HttpClient);
  readonly authService = inject(AuthService);
  readonly settingsService = inject(SettingsService);

  readonly severityOptions = ['ALL', 'CRITICAL', 'MAJOR', 'MINOR', 'WARNING'];
  readonly activeSeverity = signal<string>('ALL');
  readonly alarms = signal<FaultAlarm[]>([]);

  ngOnInit(): void {
    this.loadAlarms();
  }

  filterBySeverity(sev: string): void {
    this.activeSeverity.set(sev);
    this.loadAlarms();
  }

  private loadAlarms(): void {
    const query = this.activeSeverity() !== 'ALL' ? `?severity=${this.activeSeverity()}` : '';
    this.http.get<FaultAlarm[]>(`http://localhost:3000/api/faults${query}`).subscribe({
      next: (data) => this.alarms.set(data),
      error: (err) => console.error('[FaultManagement] Alarms fetch failure:', err)
    });
  }
}

/**
 * Exposed Module Entry Point for Native Federation
 */
export const FAULT_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    component: FaultManagementRootComponent
  }
];

