import {
  Component, ChangeDetectionStrategy, signal, inject, OnInit, input
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { VitalsApiService } from '../../../core/api/vitals.service';
import { PatientApiService } from '../../../core/api/patient.service';
import { NotificationService } from '../../../core/state/notification.service';
import { SyncQueueService } from '../../../offline-sync/sync-queue.service';

@Component({
  selector: 'app-vitals-entry',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Record Vitals</h1>
          @if (patient()) {
            <p class="page-sub">
              {{ patient()!.firstName }} {{ patient()!.lastName }} —
              <span class="uhid">{{ patient()!.uhid }}</span>
            </p>
          }
        </div>
        <a routerLink="/nurse/queue" class="btn-secondary">← Patient Queue</a>
      </div>

      @if (!isOnline()) {
        <div class="offline-banner" role="alert">
          ⚠ Offline mode — vitals will sync when connection is restored
        </div>
      }

      <div class="form-card">
        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="vitals-grid">

            <div class="vital-field">
              <label>Blood Pressure *</label>
              <div class="input-with-unit">
                <input formControlName="bp" placeholder="120/80" [class.invalid]="inv('bp')" />
                <span class="unit">mmHg</span>
              </div>
              @if (inv('bp')) { <span class="err">Required (e.g. 120/80)</span> }
            </div>

            <div class="vital-field">
              <label>Pulse Rate *</label>
              <div class="input-with-unit">
                <input type="number" formControlName="pulse" placeholder="72" [class.invalid]="inv('pulse')" />
                <span class="unit">bpm</span>
              </div>
              @if (inv('pulse')) { <span class="err">Required</span> }
            </div>

            <div class="vital-field">
              <label>Temperature *</label>
              <div class="input-with-unit">
                <input type="number" step="0.1" formControlName="temperature" placeholder="98.6" [class.invalid]="inv('temperature')" />
                <span class="unit">°F</span>
              </div>
              @if (inv('temperature')) { <span class="err">Required</span> }
            </div>

            <div class="vital-field">
              <label>SpO2 *</label>
              <div class="input-with-unit">
                <input type="number" formControlName="spo2" placeholder="98" [class.invalid]="inv('spo2')" />
                <span class="unit">%</span>
              </div>
              @if (inv('spo2')) { <span class="err">Required</span> }
            </div>

            <div class="vital-field">
              <label>Weight</label>
              <div class="input-with-unit">
                <input type="number" step="0.1" formControlName="weight" placeholder="65" />
                <span class="unit">kg</span>
              </div>
            </div>

            <div class="vital-field">
              <label>Height</label>
              <div class="input-with-unit">
                <input type="number" formControlName="height" placeholder="170" />
                <span class="unit">cm</span>
              </div>
            </div>

            <div class="vital-field">
              <label>Respiratory Rate</label>
              <div class="input-with-unit">
                <input type="number" formControlName="respiratoryRate" placeholder="16" />
                <span class="unit">/min</span>
              </div>
            </div>

            <div class="vital-field">
              <label>Random Blood Sugar</label>
              <div class="input-with-unit">
                <input type="number" formControlName="rbs" placeholder="110" />
                <span class="unit">mg/dL</span>
              </div>
            </div>
          </div>

          <div class="vital-field full">
            <label>Chief Complaint / Nurse Notes</label>
            <textarea formControlName="notes" rows="3" placeholder="Patient complaint, relevant observations..."></textarea>
          </div>

          @if (error()) {
            <div class="error-banner" role="alert">{{ error() }}</div>
          }

          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="form.reset()">Reset</button>
            <button type="submit" class="btn-primary" [disabled]="loading()">
              {{ loading() ? 'Saving...' : 'Save Vitals' }}
            </button>
          </div>
        </form>
      </div>

      @if (lastVitals()) {
        <div class="prev-card">
          <div class="prev-title">Previous Vitals — {{ lastVitals()!.recordedAt | date:'dd MMM, hh:mm a' }}</div>
          <div class="prev-grid">
            <span>BP: <strong>{{ lastVitals()!.bp }}</strong></span>
            <span>Pulse: <strong>{{ lastVitals()!.pulse }}</strong></span>
            <span>Temp: <strong>{{ lastVitals()!.temperature }}°F</strong></span>
            <span>SpO2: <strong>{{ lastVitals()!.spo2 }}%</strong></span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 760px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .page-title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 3px; }
    .page-sub { font-size: 13px; color: #64748b; margin: 0; }
    .uhid { font-family: monospace; color: #0ea5e9; font-weight: 600; }
    .offline-banner {
      background: #fef3c7; border: 1px solid #fcd34d; border-radius: 6px;
      padding: 10px 14px; font-size: 13px; color: #92400e; margin-bottom: 14px; font-weight: 500;
    }
    .form-card {
      background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;
      margin-bottom: 14px;
    }
    .vitals-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
    .vital-field { display: flex; flex-direction: column; gap: 4px; }
    .vital-field.full { grid-column: 1 / -1; }
    label { font-size: 12px; font-weight: 600; color: #374151; }
    .input-with-unit { display: flex; border: 1px solid #d1d5db; border-radius: 5px; overflow: hidden; }
    .input-with-unit input {
      flex: 1; border: none; padding: 9px 11px; font-size: 14px; outline: none;
      font-family: inherit; font-weight: 600; color: #0f172a;
    }
    .input-with-unit input.invalid { background: #fff5f5; }
    .unit {
      background: #f8fafc; border-left: 1px solid #d1d5db; padding: 9px 10px;
      font-size: 11px; font-weight: 700; color: #94a3b8; white-space: nowrap;
    }
    textarea {
      border: 1px solid #d1d5db; border-radius: 5px; padding: 9px 11px;
      font-size: 13px; color: #111827; outline: none; font-family: inherit; resize: vertical;
    }
    textarea:focus { border-color: #0ea5e9; box-shadow: 0 0 0 3px rgba(14,165,233,0.1); }
    .err { font-size: 11px; color: #ef4444; }
    .error-banner {
      background: #fee2e2; color: #991b1b; border: 1px solid #fecaca;
      border-radius: 4px; padding: 10px 12px; font-size: 13px; margin-bottom: 14px;
    }
    .form-actions {
      display: flex; justify-content: flex-end; gap: 10px;
      padding-top: 16px; border-top: 1px solid #f1f5f9;
    }
    .btn-primary {
      background: #0f172a; color: #fff; border: none; border-radius: 5px;
      padding: 10px 20px; font-size: 13px; font-weight: 600; cursor: pointer;
    }
    .btn-primary:disabled { background: #94a3b8; cursor: not-allowed; }
    .btn-secondary {
      background: #fff; color: #374151; border: 1px solid #d1d5db; border-radius: 5px;
      padding: 10px 16px; font-size: 13px; font-weight: 500; cursor: pointer;
      text-decoration: none; display: inline-flex; align-items: center;
    }
    .prev-card {
      background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px;
    }
    .prev-title { font-size: 11px; font-weight: 700; color: #94a3b8; margin-bottom: 8px; text-transform: uppercase; letter-spacing: .06em; }
    .prev-grid { display: flex; gap: 20px; font-size: 13px; color: #374151; flex-wrap: wrap; }
    .prev-grid strong { color: #0f172a; }
  `],
})
export class VitalsEntryComponent implements OnInit {
  patientId = input<string>('');
  private fb       = inject(FormBuilder);
  private vitalsApi = inject(VitalsApiService);
  private patientApi = inject(PatientApiService);
  private notify   = inject(NotificationService);
  private syncQ    = inject(SyncQueueService);
  private router   = inject(Router);

  readonly loading    = signal(false);
  readonly error      = signal<string | null>(null);
  readonly patient    = signal<any | null>(null);
  readonly lastVitals = signal<any | null>(null);
  readonly isOnline   = signal(navigator.onLine);

  form = this.fb.group({
    bp:             ['', Validators.required],
    pulse:          [null, Validators.required],
    temperature:    [null, Validators.required],
    spo2:           [null, Validators.required],
    weight:         [null],
    height:         [null],
    respiratoryRate:[null],
    rbs:            [null],
    notes:          [''],
  });

  ngOnInit() {
    const pid = this.patientId();
    if (pid) {
      this.patientApi.getById(pid).subscribe(p => this.patient.set(p));
      this.vitalsApi.getLatest(pid).subscribe(v => this.lastVitals.set(v));
    }
    window.addEventListener('online',  () => this.isOnline.set(true));
    window.addEventListener('offline', () => this.isOnline.set(false));
  }

  inv(f: string): boolean {
    const c = this.form.get(f);
    return !!(c?.invalid && c?.touched);
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    const payload = { ...this.form.getRawValue(), patientId: this.patientId() };

    if (!navigator.onLine) {
      this.syncQ.enqueue({ id: crypto.randomUUID(), method: 'POST', url: '/vitals', body: payload, headers: {}, timestamp: new Date().toISOString(), retryCount: 0 });
      this.notify.show('Vitals queued for sync', 'warning');
      this.router.navigate(['/nurse/queue']);
      return;
    }

    this.vitalsApi.record(payload as any).subscribe({
      next: () => {
        this.notify.show('Vitals saved successfully', 'success');
        this.router.navigate(['/nurse/queue']);
      },
      error: (e) => { this.error.set(e?.error?.message ?? 'Save failed'); this.loading.set(false); },
    });
  }
}
