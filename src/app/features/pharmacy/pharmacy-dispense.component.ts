import {
  Component, ChangeDetectionStrategy, signal, inject, OnInit
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VisitApiService } from '../../core/api/visit.service';
import { NotificationService } from '../../core/state/notification.service';

@Component({
  selector: 'app-pharmacy-dispense',
  standalone: true,
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Pharmacy</h1>
          <p class="page-sub">{{ pending().length }} prescriptions pending dispensing</p>
        </div>
        <button class="btn-refresh" (click)="load()">↻ Refresh</button>
      </div>

      <div class="search-bar">
        <input [(ngModel)]="searchQuery" placeholder="Search by patient name or UHID..."
          class="search-input" (input)="filterPrescriptions()" />
      </div>

      @if (loading()) {
        <div class="loading">Loading prescriptions...</div>
      } @else {
        <div class="rx-list">
          @for (rx of filtered(); track rx.id) {
            <div class="rx-card" [class.dispensed]="rx.dispensed">
              <div class="rx-header">
                <div class="rx-patient">
                  <div class="rx-name">{{ rx.patientName }}</div>
                  <div class="rx-meta">
                    <span class="uhid">{{ rx.uhid }}</span>
                    <span>· Prescribed by Dr. {{ rx.doctorName }}</span>
                    <span>· {{ rx.prescribedAt | date:'dd MMM, hh:mm a' }}</span>
                  </div>
                </div>
                <div class="rx-status">
                  @if (rx.dispensed) {
                    <span class="badge-done">✓ Dispensed</span>
                  } @else {
                    <button class="btn-dispense" (click)="dispense(rx)" [disabled]="rx.processing">
                      {{ rx.processing ? 'Dispensing...' : '⬡ Dispense All' }}
                    </button>
                  }
                </div>
              </div>
              <div class="drug-list">
                @for (drug of rx.drugs; track drug.name) {
                  <div class="drug-row">
                    <span class="drug-name">{{ drug.name }}</span>
                    <span class="drug-dose">{{ drug.dose }}</span>
                    <span class="drug-freq">{{ drug.frequency }}</span>
                    <span class="drug-dur">{{ drug.duration }}</span>
                  </div>
                }
              </div>
            </div>
          }

          @if (filtered().length === 0) {
            <div class="empty">No prescriptions found.</div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 960px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .page-title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 3px; }
    .page-sub { font-size: 13px; color: #64748b; margin: 0; }
    .btn-refresh {
      background: #fff; border: 1px solid #e5e7eb; border-radius: 5px;
      padding: 8px 14px; font-size: 13px; cursor: pointer; color: #374151;
    }
    .search-bar { margin-bottom: 14px; }
    .search-input {
      width: 100%; max-width: 380px; border: 1px solid #d1d5db; border-radius: 5px;
      padding: 9px 12px; font-size: 13px; outline: none; font-family: inherit;
    }
    .loading, .empty { padding: 40px; text-align: center; color: #94a3b8; font-size: 14px; }
    .rx-list { display: flex; flex-direction: column; gap: 10px; }
    .rx-card {
      background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;
    }
    .rx-card.dispensed { opacity: .7; }
    .rx-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      padding: 14px 16px; border-bottom: 1px solid #f1f5f9;
    }
    .rx-name { font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 3px; }
    .rx-meta { font-size: 11px; color: #94a3b8; display: flex; gap: 4px; flex-wrap: wrap; }
    .uhid { font-family: monospace; color: #0ea5e9; font-weight: 600; }
    .badge-done {
      background: #dcfce7; color: #166534; font-size: 11px; font-weight: 700;
      padding: 4px 10px; border-radius: 4px;
    }
    .btn-dispense {
      background: #0f172a; color: #fff; border: none; border-radius: 5px;
      padding: 7px 14px; font-size: 12px; font-weight: 600; cursor: pointer;
    }
    .btn-dispense:disabled { background: #94a3b8; cursor: not-allowed; }
    .drug-list { padding: 10px 16px; display: flex; flex-direction: column; gap: 6px; }
    .drug-row {
      display: flex; gap: 12px; align-items: center; font-size: 12px;
      padding: 5px 0; border-bottom: 1px solid #f8fafc;
    }
    .drug-row:last-child { border: none; }
    .drug-name { font-weight: 600; color: #0f172a; min-width: 160px; }
    .drug-dose { color: #64748b; min-width: 80px; }
    .drug-freq { color: #64748b; min-width: 100px; }
    .drug-dur  { color: #94a3b8; }
  `],
})
export class PharmacyDispenseComponent implements OnInit {
  private visitApi = inject(VisitApiService);
  private notify   = inject(NotificationService);

  readonly loading = signal(true);
  readonly rxList  = signal<any[]>([]);
  readonly filtered = signal<any[]>([]);

  searchQuery = '';

  readonly pending = () => this.rxList().filter(r => !r.dispensed);

  ngOnInit() { this.load(); }

  load(): void {
    this.loading.set(true);
    this.visitApi.getPendingPrescriptions().subscribe({
      next: (data) => {
        this.rxList.set(data);
        this.filtered.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  filterPrescriptions(): void {
    const q = this.searchQuery.toLowerCase();
    this.filtered.set(
      this.rxList().filter(r =>
        r.patientName.toLowerCase().includes(q) ||
        r.uhid.toLowerCase().includes(q)
      )
    );
  }

  dispense(rx: any): void {
    rx.processing = true;
    this.visitApi.dispensePrescription(rx.id).subscribe({
      next: () => {
        rx.dispensed   = true;
        rx.processing  = false;
        this.rxList.update(list => [...list]);
        this.notify.show(`Dispensed for ${rx.patientName}`, 'success');
      },
      error: () => { rx.processing = false; this.notify.show('Dispense failed', 'error'); },
    });
  }
}
