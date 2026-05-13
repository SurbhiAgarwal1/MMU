import {
  Component, ChangeDetectionStrategy, signal, inject, OnInit
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { VisitApiService } from '../../core/api/visit.service';

@Component({
  selector: 'app-doctor-queue',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Doctor Queue</h1>
          <p class="page-sub">{{ queue().length }} patients ready for consultation</p>
        </div>
        <button class="btn-refresh" (click)="load()">↻ Refresh</button>
      </div>

      @if (loading()) {
        <div class="loading">Loading queue...</div>
      } @else if (queue().length === 0) {
        <div class="empty">
          <div class="empty-icon">✦</div>
          <div>No patients in queue</div>
        </div>
      } @else {
        <div class="queue-list">
          @for (visit of queue(); track visit.id) {
            <div class="queue-card">
              <div class="token">{{ visit.tokenNumber }}</div>
              <div class="patient-info">
                <div class="name">{{ visit.patientName }}</div>
                <div class="meta">
                  <span class="uhid">{{ visit.uhid }}</span>
                  <span>{{ visit.age }}y / {{ visit.gender }}</span>
                  @if (visit.complaint) {
                    <span class="complaint">— {{ visit.complaint }}</span>
                  }
                </div>
                @if (visit.vitals) {
                  <div class="vitals-preview">
                    BP: {{ visit.vitals.bp }} · Pulse: {{ visit.vitals.pulse }} ·
                    Temp: {{ visit.vitals.temperature }}°F · SpO2: {{ visit.vitals.spo2 }}%
                  </div>
                }
              </div>
              <div class="card-actions">
                <span class="wait">⏱ {{ visit.waitMinutes }}m</span>
                <a [routerLink]="['/doctor/consultation', visit.patientId]" class="btn-consult">
                  ✦ Consult
                </a>
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
    .loading { padding: 40px; text-align: center; color: #94a3b8; font-size: 14px; }
    .empty { padding: 60px; text-align: center; color: #94a3b8; }
    .empty-icon { font-size: 32px; margin-bottom: 8px; }
    .queue-list { display: flex; flex-direction: column; gap: 8px; }
    .queue-card {
      background: #fff; border: 1px solid #e5e7eb; border-radius: 8px;
      padding: 14px 16px; display: flex; align-items: center; gap: 14px;
    }
    .token {
      width: 36px; height: 36px; background: #eff6ff; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 700; color: #1e40af; flex-shrink: 0;
    }
    .patient-info { flex: 1; }
    .name { font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 3px; }
    .meta { display: flex; gap: 8px; font-size: 12px; color: #64748b; flex-wrap: wrap; }
    .uhid { font-family: monospace; color: #0ea5e9; font-weight: 600; }
    .complaint { color: #94a3b8; }
    .vitals-preview {
      margin-top: 5px; font-size: 11px; color: #64748b;
      background: #f8fafc; padding: 4px 8px; border-radius: 4px; display: inline-block;
    }
    .card-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
    .wait { font-size: 12px; color: #94a3b8; }
    .btn-consult {
      background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe;
      border-radius: 5px; padding: 7px 14px; font-size: 12px; font-weight: 600;
      text-decoration: none;
    }
    .btn-consult:hover { background: #dbeafe; }
  `],
})
export class DoctorQueueComponent implements OnInit {
  private visitApi = inject(VisitApiService);

  readonly loading = signal(true);
  readonly queue   = signal<any[]>([]);

  ngOnInit() { this.load(); }

  load(): void {
    this.loading.set(true);
    this.visitApi.getDoctorQueue().subscribe({
      next: (data) => { this.queue.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
