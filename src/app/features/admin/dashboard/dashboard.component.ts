import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UpperCasePipe } from '@angular/common';
import { AuthStore } from '../../../core/state/auth.store';

interface StatCard { label: string; value: string; icon: string; color: string; }
interface QuickAction { label: string; path: string; icon: string; role: string; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, UpperCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dashboard">
      <div class="dash-header">
        <div>
          <h1 class="dash-title">Good {{ greeting() }}, {{ user()?.fullName?.split(' ')[0] }}</h1>
          <p class="dash-sub">{{ today }}</p>
        </div>
        <span class="role-chip">{{ user()?.role | uppercase }}</span>
      </div>

      <!-- Stats -->
      <div class="stats-grid">
        @for (stat of stats; track stat.label) {
          <div class="stat-card" [style.border-left-color]="stat.color">
            <div class="stat-icon" [style.color]="stat.color">{{ stat.icon }}</div>
            <div>
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        }
      </div>

      <!-- Quick Actions -->
      <div class="section-title">Quick Actions</div>
      <div class="actions-grid">
        @for (action of quickActions; track action.path) {
          <a [routerLink]="action.path" class="action-card">
            <span class="action-icon">{{ action.icon }}</span>
            <span class="action-label">{{ action.label }}</span>
          </a>
        }
      </div>

      <!-- Activity -->
      <div class="section-title" style="margin-top:24px">Recent Activity</div>
      <div class="activity-list">
        @for (item of activity; track item.time) {
          <div class="activity-row">
            <div class="activity-dot" [style.background]="item.color"></div>
            <div class="activity-info">
              <span class="activity-text">{{ item.text }}</span>
              <span class="activity-time">{{ item.time }}</span>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1100px; }
    .dash-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 24px;
    }
    .dash-title { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 3px; }
    .dash-sub { font-size: 13px; color: #64748b; margin: 0; }
    .role-chip {
      font-size: 10px; font-weight: 700; letter-spacing: .08em;
      background: #0f172a; color: #fff;
      padding: 4px 10px; border-radius: 4px;
    }
    .stats-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr));
      gap: 12px; margin-bottom: 28px;
    }
    .stat-card {
      background: #fff; border: 1px solid #e5e7eb; border-radius: 8px;
      border-left: 3px solid; padding: 16px;
      display: flex; gap: 14px; align-items: center;
    }
    .stat-icon { font-size: 24px; }
    .stat-value { font-size: 24px; font-weight: 700; color: #0f172a; line-height: 1; }
    .stat-label { font-size: 12px; color: #64748b; margin-top: 2px; }
    .section-title {
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: .08em; color: #94a3b8; margin-bottom: 12px;
    }
    .actions-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(140px,1fr));
      gap: 10px;
    }
    .action-card {
      background: #fff; border: 1px solid #e5e7eb; border-radius: 8px;
      padding: 16px 12px; display: flex; flex-direction: column; align-items: center;
      gap: 8px; text-decoration: none; color: #374151; font-size: 13px;
      font-weight: 500; transition: all .15s; cursor: pointer;
    }
    .action-card:hover { border-color: #0ea5e9; background: #f0f9ff; color: #0369a1; }
    .action-icon { font-size: 22px; }
    .action-label { font-size: 12px; text-align: center; }
    .activity-list {
      background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;
    }
    .activity-row {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 16px; border-bottom: 1px solid #f1f5f9;
    }
    .activity-row:last-child { border: none; }
    .activity-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .activity-info { display: flex; justify-content: space-between; flex: 1; }
    .activity-text { font-size: 13px; color: #374151; }
    .activity-time { font-size: 11px; color: #94a3b8; }
  `],
})
export class DashboardComponent implements OnInit {
  private authStore = inject(AuthStore);
  readonly user = this.authStore.user;

  today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  greeting = signal('morning');

  stats: StatCard[] = [
    { label: 'Patients Today',    value: '142', icon: '♟', color: '#0ea5e9' },
    { label: 'Consultations',     value: '89',  icon: '✦', color: '#8b5cf6' },
    { label: 'Pending Lab',       value: '23',  icon: '⊕', color: '#f59e0b' },
    { label: 'Prescriptions',     value: '67',  icon: '⬡', color: '#10b981' },
  ];

  quickActions: QuickAction[] = [
    { label: 'Register Patient', path: '/registration/new',  icon: '✚', role: 'all' },
    { label: 'Nurse Station',    path: '/nurse/queue',        icon: '♥', role: 'nurse' },
    { label: 'Consultation',     path: '/doctor/queue',       icon: '✦', role: 'doctor' },
    { label: 'Pharmacy',         path: '/pharmacy/dispense',  icon: '⬡', role: 'pharmacist' },
    { label: 'Lab Orders',       path: '/lab/pending',        icon: '⊕', role: 'lab' },
    { label: 'Admin Panel',      path: '/admin',              icon: '⚙', role: 'admin' },
  ];

  activity = [
    { text: 'Patient UHID-2048 registered',        time: '2 min ago',  color: '#10b981' },
    { text: 'Vitals recorded — UHID-2041',         time: '8 min ago',  color: '#0ea5e9' },
    { text: 'Prescription issued — UHID-2035',     time: '15 min ago', color: '#8b5cf6' },
    { text: 'Lab result uploaded — UHID-2029',     time: '22 min ago', color: '#f59e0b' },
    { text: 'Pharmacy dispensed — UHID-2019',      time: '31 min ago', color: '#10b981' },
  ];

  ngOnInit() {
    const h = new Date().getHours();
    this.greeting.set(h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening');
  }
}
