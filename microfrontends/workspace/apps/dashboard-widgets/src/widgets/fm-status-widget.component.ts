import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

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
        Filter: <code>{{ severityFilter() }}</code> • Click counter to emit event
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .widget-box { border: 1px solid #374151; background: #111827; color: #f9fafb; border-radius: 10px; padding: 1.25rem; }
    .widget-box[data-theme='light'] { border-color: #d1d5db; background: #ffffff; color: #111827; }
    .widget-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .widget-header h4 { margin: 0; font-size: 0.95rem; font-weight: 700; text-transform: uppercase; }
    .pulse-tag { font-size: 0.7rem; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 700; }
    .counters-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
    .counter-card { padding: 0.85rem; border-radius: 8px; text-align: center; cursor: pointer; transition: transform 0.15s ease; }
    .counter-card:hover { transform: translateY(-2px); }
    .counter-card.critical { background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #ef4444; }
    .counter-card.major { background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); color: #f59e0b; }
    .counter-card.minor { background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; }
    .count { display: block; font-size: 1.5rem; font-weight: 900; line-height: 1; margin-bottom: 0.35rem; }
    .label { font-size: 0.75rem; text-transform: uppercase; font-weight: 700; }
    .footer-note { font-size: 0.75rem; color: #9ca3af; margin-top: 1rem; }
    code { font-family: monospace; }
  `]
})
export class FmStatusWidgetComponent {
  readonly theme = input<'light' | 'dark'>('dark');
  readonly severityFilter = input<string>('ALL');
  readonly alertClick = output<{ alarmId: string; severity: string; message: string }>();

  triggerAlert(severity: string): void {
    this.alertClick.emit({
      alarmId: `ALM-${Math.floor(1000 + Math.random() * 9000)}`,
      severity,
      message: `Fast-triage dispatch initiated for ${severity} alarm queue.`
    });
  }
}

