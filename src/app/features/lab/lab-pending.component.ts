import {
  Component, ChangeDetectionStrategy, signal, inject, OnInit
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { VisitApiService } from '../../core/api/visit.service';
import { NotificationService } from '../../core/state/notification.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-lab-pending',
  standalone: true,
  imports: [RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Laboratory</h1>
          <p class="page-sub">{{ orders().length }} pending lab orders</p>
        </div>
        <button class="btn-refresh" (click)="load()">↻ Refresh</button>
      </div>

      @if (loading()) {
        <div class="loading">Loading lab orders...</div>
      } @else if (orders().length === 0) {
        <div class="empty">No pending lab orders.</div>
      } @else {
        <div class="orders-list">
          @for (order of orders(); track order.id) {
            <div class="order-card">
              <div class="order-header">
                <div>
                  <div class="patient-name">{{ order.patientName }}</div>
                  <div class="patient-meta">
                    <span class="uhid">{{ order.uhid }}</span>
                    <span>· Ordered by Dr. {{ order.doctorName }}</span>
                    <span>· {{ order.orderedAt | date:'dd MMM, hh:mm a' }}</span>
                  </div>
                </div>
                <div class="order-status">
                  @switch (order.status) {
                    @case ('pending') {
                      <span class="badge-pending">Pending</span>
                    }
                    @case ('processing') {
                      <span class="badge-processing">Processing</span>
                    }
                    @case ('completed') {
                      <span class="badge-done">✓ Completed</span>
                    }
                  }
                </div>
              </div>

              <div class="tests-list">
                @for (test of order.tests; track test) {
                  <span class="test-tag">{{ test }}</span>
                }
              </div>

              @if (order.status !== 'completed') {
                <div class="order-actions">
                  @if (order.status === 'pending') {
                    <button class="btn-start" (click)="updateStatus(order, 'processing')">
                      Start Processing
                    </button>
                  }
                  @if (order.status === 'processing') {
                    <button class="btn-complete" (click)="updateStatus(order, 'completed')">
                      ✓ Mark Complete
                    </button>
                  }
                </div>
              }
            </div>
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
    .loading, .empty { padding: 40px; text-align: center; color: #94a3b8; font-size: 14px; }
    .orders-list { display: flex; flex-direction: column; gap: 10px; }
    .order-card {
      background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px;
    }
    .order-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
    .patient-name { font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 3px; }
    .patient-meta { font-size: 11px; color: #94a3b8; display: flex; gap: 4px; flex-wrap: wrap; }
    .uhid { font-family: monospace; color: #0ea5e9; font-weight: 600; }
    .badge-pending {
      background: #fef3c7; color: #92400e; font-size: 11px; font-weight: 700;
      padding: 3px 9px; border-radius: 4px;
    }
    .badge-processing {
      background: #dbeafe; color: #1e40af; font-size: 11px; font-weight: 700;
      padding: 3px 9px; border-radius: 4px;
    }
    .badge-done {
      background: #dcfce7; color: #166534; font-size: 11px; font-weight: 700;
      padding: 3px 9px; border-radius: 4px;
    }
    .tests-list { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .test-tag {
      background: #f5f3ff; color: #5b21b6; font-size: 12px; font-weight: 600;
      padding: 3px 10px; border-radius: 4px; border: 1px solid #ddd6fe;
    }
    .order-actions { padding-top: 10px; border-top: 1px solid #f1f5f9; display: flex; gap: 8px; }
    .btn-start {
      background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe;
      border-radius: 5px; padding: 7px 14px; font-size: 12px; font-weight: 600; cursor: pointer;
    }
    .btn-complete {
      background: #0f172a; color: #fff; border: none;
      border-radius: 5px; padding: 7px 14px; font-size: 12px; font-weight: 600; cursor: pointer;
    }
  `],
})
export class LabPendingComponent implements OnInit {
  private visitApi = inject(VisitApiService);
  private notify   = inject(NotificationService);

  readonly loading = signal(true);
  readonly orders  = signal<any[]>([]);

  ngOnInit() { this.load(); }

  load(): void {
    this.loading.set(true);
    this.visitApi.getPendingLabOrders().subscribe({
      next: (data) => { this.orders.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  updateStatus(order: any, status: string): void {
    this.visitApi.updateLabOrderStatus(order.id, status).subscribe({
      next: () => {
        order.status = status;
        this.orders.update(list => [...list]);
        this.notify.show(`Order marked as ${status}`, 'success');
      },
      error: () => this.notify.show('Update failed', 'error'),
    });
  }
}
