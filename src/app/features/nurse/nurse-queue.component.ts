import {
  Component, ChangeDetectionStrategy, signal, inject, OnInit, computed
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { VisitApiService } from '../../core/api/visit.service';

@Component({
  selector: 'app-nurse-queue',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Nurse Station</h1>
          <p class="page-sub">{{ pending().length }} patients waiting for vitals</p>
        </div>
        <div class="header-actions">
          <button class="btn-refresh" (click)="load()">↻ Refresh</button>
        </div>
      </div>

      <div class="filter-tabs">
        @for (tab of tabs; track tab.key) {
          <button
            class="tab-btn"
            [class.active]="activeTab() === tab.key"
            (click)="activeTab.set(tab.key)"
          >
            {{ tab.label }}
            <span class="tab-count">{{ countByTab(tab.key) }}</span>
          </button>
        }
      </div>

      @if (loading()) {
        <div class="loading">Loading queue...</div>
      } @else if (filteredQueue().length === 0) {
        <div class="empty">No patients in this queue.</div>
      } @else {
        <div class="queue-list">
          @for (visit of filteredQueue(); track visit.id) {
            <div class="queue-card" [class.urgent]="visit.priority === 'urgent'">
              <div class="queue-num">{{ visit.tokenNumber }}</div>
              <div class="queue-info">
                <div class="patient-name">{{ visit.patientName }}</div>
                <div class="patient-meta">
                  <span class="uhid">{{ visit.uhid }}</span>
                  <span class="sep">·</span>
                  <span>{{ visit.age }}y / {{ visit.gender }}</span>
                  <span class="sep">·</span>
                  <span class="wait-time">⏱ {{ visit.waitMinutes }} min wait</span>
                </div>
                @if (visit.complaint) {
                  <div class="complaint">{{ visit.complaint }}</div>
                }
              </div>
              <div class="queue-actions">
                @if (visit.priority === 'urgent') {
                  <span class="urgent-badge">URGENT</span>
                }
                <a
                  [routerLink]="['/nurse/vitals', visit.patientId]"
                  class="btn-vitals"
                >♥ Record Vitals</a>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 900px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .page-title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 3px; }
    .page-sub { font-size: 13px; color: #64748b; margin: 0; }
    .btn-refresh {
      background: #fff; border: 1px solid #e5e7eb; border-radius: 5px;
      padding: 8px 14px; font-size: 13px; cursor: pointer; color: #374151;
    }
    .filter-tabs { display: flex; gap: 4px; margin-bottom: 16px; }
    .tab-btn {
      background: #fff; border: 1px solid #e5e7eb; border-radius: 5px;
      padding: 7px 14px; font-size: 12px; font-weight: 500; cursor: pointer;
      color: #64748b; display: flex; align-items: center; gap: 6px;
    }
    .tab-btn.active { background: #0f172a; color: #fff; border-color: #0f172a; }
    .tab-count {
      background: rgba(255,255,255,0.2); border-radius: 10px;
      padding: 1px 6px; font-size: 10px; font-weight: 700;
    }
    .tab-btn:not(.active) .tab-count { background: #f1f5f9; color: #64748b; }
    .loading, .empty { padding: 40px; text-align: center; color: #94a3b8; font-size: 14px; }
    .queue-list { display: flex; flex-direction: column; gap: 8px; }
    .queue-card {
      background: #fff; border: 1px solid #e5e7eb; border-radius: 8px;
      padding: 14px 16px; display: flex; align-items: center; gap: 14px;
    }
    .queue-card.urgent { border-color: #fca5a5; background: #fff5f5; }
    .queue-num {
      width: 36px; height: 36px; background: #f1f5f9; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 700; color: #0f172a; flex-shrink: 0;
    }
    .queue-info { flex: 1; }
    .patient-name { font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 3px; }
    .patient-meta { display: flex; gap: 6px; align-items: center; font-size: 12px; color: #64748b; flex-wrap: wrap; }
    .uhid { font-family: monospace; color: #0ea5e9; font-weight: 600; }
    .sep { color: #d1d5db; }
    .wait-time { color: #f59e0b; font-weight: 600; }
    .complaint { font-size: 12px; color: #64748b; margin-top: 4px; font-style: italic; }
    .queue-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
    .urgent-badge {
      background: #fee2e2; color: #991b1b; font-size: 9px; font-weight: 700;
      padding: 2px 7px; border-radius: 3px; letter-spacing: .06em;
    }
    .btn-vitals {
      background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0;
      border-radius: 5px; padding: 7px 14px; font-size: 12px; font-weight: 600;
      text-decoration: none; white-space: nowrap;
    }
    .btn-vitals:hover { background: #d1fae5; }
  `],
})
export class NurseQueueComponent implements OnInit {
  private visitApi = inject(VisitApiService);

  readonly loading   = signal(true);
  readonly queue     = signal<any[]>([]);
  readonly activeTab = signal<string>('all');

  readonly pending  = computed(() => this.queue().filter(v => !v.vitalsRecorded));
  readonly filteredQueue = computed(() => {
    const tab = this.activeTab();
    const q   = this.queue();
    if (tab === 'all')    return q;
    if (tab === 'urgent') return q.filter(v => v.priority === 'urgent');
    if (tab === 'waiting')return q.filter(v => !v.vitalsRecorded);
    if (tab === 'done')   return q.filter(v => v.vitalsRecorded);
    return q;
  });

  tabs = [
    { key: 'all',     label: 'All' },
    { key: 'waiting', label: 'Waiting' },
    { key: 'urgent',  label: 'Urgent' },
    { key: 'done',    label: 'Done' },
  ];

  countByTab(key: string): number {
    if (key === 'all')    return this.queue().length;
    if (key === 'urgent') return this.queue().filter(v => v.priority === 'urgent').length;
    if (key === 'waiting')return this.queue().filter(v => !v.vitalsRecorded).length;
    if (key === 'done')   return this.queue().filter(v => v.vitalsRecorded).length;
    return 0;
  }

  ngOnInit() { this.load(); }

  load(): void {
    this.loading.set(true);
    this.visitApi.getNurseQueue().subscribe({
      next: (data) => { this.queue.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
