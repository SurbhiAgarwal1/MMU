import {
  Component, ChangeDetectionStrategy, signal, inject, OnInit, input, computed
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { ConsultationApiService } from '../../../core/api/consultation.service';
import { PatientApiService } from '../../../core/api/patient.service';
import { VitalsApiService } from '../../../core/api/vitals.service';
import { NotificationService } from '../../../core/state/notification.service';

@Component({
  selector: 'app-consultation',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Doctor Consultation</h1>
          @if (patient()) {
            <p class="page-sub">
              {{ patient()!.firstName }} {{ patient()!.lastName }} —
              <span class="uhid">{{ patient()!.uhid }}</span>
            </p>
          }
        </div>
        <a routerLink="/doctor/queue" class="btn-secondary">← Doctor Queue</a>
      </div>

      <div class="consult-layout">
        <!-- Left: Patient context -->
        <aside class="patient-panel">
          @if (vitals()) {
            <div class="panel-card">
              <div class="panel-title">Today's Vitals</div>
              <div class="vital-row"><span>BP</span><strong>{{ vitals()!.bp }} mmHg</strong></div>
              <div class="vital-row"><span>Pulse</span><strong>{{ vitals()!.pulse }} bpm</strong></div>
              <div class="vital-row"><span>Temp</span><strong>{{ vitals()!.temperature }}°F</strong></div>
              <div class="vital-row"><span>SpO2</span><strong>{{ vitals()!.spo2 }}%</strong></div>
              @if (vitals()!.weight) {
                <div class="vital-row"><span>Weight</span><strong>{{ vitals()!.weight }} kg</strong></div>
              }
            </div>
          }

          @if (patient()) {
            <div class="panel-card">
              <div class="panel-title">Patient Info</div>
              <div class="vital-row"><span>Age</span><strong>{{ calcAge(patient()!.dob) }} yrs</strong></div>
              <div class="vital-row"><span>Gender</span><strong>{{ patient()!.gender | titlecase }}</strong></div>
              <div class="vital-row"><span>Blood</span><strong>{{ patient()!.bloodGroup || '—' }}</strong></div>
              @if (patient()!.allergies?.length) {
                <div class="allergy-section">
                  <div class="allergy-label">⚠ Allergies</div>
                  @for (a of patient()!.allergies; track a) {
                    <span class="allergy-tag">{{ a }}</span>
                  }
                </div>
              }
            </div>
          }
        </aside>

        <!-- Right: Consultation form -->
        <main class="consult-form-area">
          <form [formGroup]="form" (ngSubmit)="submit()" novalidate>

            <div class="form-card">
              <div class="section-label">Chief Complaint *</div>
              <textarea formControlName="chiefComplaint" rows="2"
                placeholder="Patient's primary complaint..."
                [class.invalid]="inv('chiefComplaint')">
              </textarea>
              @if (inv('chiefComplaint')) { <span class="err">Required</span> }
            </div>

            <!-- Diagnoses -->
            <div class="form-card">
              <div class="card-header">
                <div class="section-label">Diagnoses (ICD-10)</div>
                <button type="button" class="add-btn" (click)="addDiagnosis()">+ Add</button>
              </div>
              @for (d of diagnoses.controls; track $index; let i = $index) {
                <div class="array-row" [formGroupName]="i" formArrayName="diagnoses">
                  <input formControlName="code" placeholder="ICD code" class="code-input" />
                  <input formControlName="name" placeholder="Diagnosis name" class="name-input" />
                  <button type="button" class="remove-btn" (click)="removeDiagnosis(i)">✕</button>
                </div>
              }
              @if (diagnoses.length === 0) {
                <div class="empty-hint">No diagnoses added. Click + Add.</div>
              }
            </div>

            <!-- Prescriptions -->
            <div class="form-card">
              <div class="card-header">
                <div class="section-label">Prescriptions</div>
                <button type="button" class="add-btn" (click)="addPrescription()">+ Add</button>
              </div>
              @for (p of prescriptions.controls; track $index; let i = $index) {
                <div class="rx-row" [formGroupName]="i" formArrayName="prescriptions">
                  <input formControlName="drug"      placeholder="Drug name"    class="drug-input" />
                  <input formControlName="dose"      placeholder="Dose"         class="dose-input" />
                  <input formControlName="frequency" placeholder="Frequency"    class="freq-input" />
                  <input formControlName="duration"  placeholder="Duration"     class="dur-input" />
                  <button type="button" class="remove-btn" (click)="removePrescription(i)">✕</button>
                </div>
              }
              @if (prescriptions.length === 0) {
                <div class="empty-hint">No prescriptions added.</div>
              }
            </div>

            <!-- Notes -->
            <div class="form-card">
              <div class="section-label">Clinical Notes</div>
              <textarea formControlName="notes" rows="3"
                placeholder="Examination findings, advice, follow-up instructions...">
              </textarea>
            </div>

            <!-- Lab Orders -->
            <div class="form-card">
              <div class="section-label">Lab Orders (comma separated)</div>
              <input formControlName="labOrders" placeholder="CBC, LFT, RFT, Blood Sugar..." />
            </div>

            @if (error()) {
              <div class="error-banner" role="alert">{{ error() }}</div>
            }

            <div class="form-actions">
              <button type="button" class="btn-secondary" (click)="form.reset()">Clear</button>
              <button type="submit" class="btn-primary" [disabled]="loading()">
                {{ loading() ? 'Saving...' : '✓ Complete Consultation' }}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 1100px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .page-title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 3px; }
    .page-sub { font-size: 13px; color: #64748b; margin: 0; }
    .uhid { font-family: monospace; color: #0ea5e9; font-weight: 600; }
    .consult-layout { display: grid; grid-template-columns: 240px 1fr; gap: 14px; }
    .patient-panel { display: flex; flex-direction: column; gap: 10px; }
    .panel-card {
      background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px;
    }
    .panel-title {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: .08em; color: #94a3b8; margin-bottom: 10px;
    }
    .vital-row {
      display: flex; justify-content: space-between; font-size: 12px;
      padding: 5px 0; border-bottom: 1px solid #f8fafc; color: #64748b;
    }
    .vital-row:last-child { border: none; }
    .vital-row strong { color: #0f172a; }
    .allergy-section { margin-top: 10px; }
    .allergy-label { font-size: 10px; font-weight: 700; color: #b45309; margin-bottom: 5px; }
    .allergy-tag {
      display: inline-block; background: #fef3c7; color: #92400e;
      font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 3px; margin: 2px;
    }
    .consult-form-area { display: flex; flex-direction: column; gap: 10px; }
    .form-card {
      background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;
    }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .section-label {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: .08em; color: #94a3b8; margin-bottom: 8px;
    }
    .card-header .section-label { margin: 0; }
    textarea, input[type=text], input:not([type]) {
      width: 100%; border: 1px solid #d1d5db; border-radius: 5px;
      padding: 9px 11px; font-size: 13px; color: #111827; outline: none;
      font-family: inherit; box-sizing: border-box;
    }
    textarea:focus, input:focus { border-color: #0ea5e9; box-shadow: 0 0 0 3px rgba(14,165,233,0.1); }
    textarea.invalid, input.invalid { border-color: #ef4444; }
    .array-row, .rx-row {
      display: flex; gap: 8px; align-items: center; margin-bottom: 8px;
    }
    .code-input  { width: 120px; flex-shrink: 0; }
    .name-input  { flex: 1; }
    .drug-input  { flex: 2; }
    .dose-input  { width: 90px; flex-shrink: 0; }
    .freq-input  { width: 110px; flex-shrink: 0; }
    .dur-input   { width: 100px; flex-shrink: 0; }
    .remove-btn {
      background: #fee2e2; border: none; color: #991b1b; border-radius: 4px;
      width: 28px; height: 28px; cursor: pointer; font-size: 11px; flex-shrink: 0;
    }
    .add-btn {
      background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af;
      border-radius: 4px; padding: 4px 10px; font-size: 12px; cursor: pointer; font-weight: 600;
    }
    .empty-hint { font-size: 12px; color: #94a3b8; font-style: italic; }
    .err { font-size: 11px; color: #ef4444; margin-top: 2px; display: block; }
    .error-banner {
      background: #fee2e2; color: #991b1b; border: 1px solid #fecaca;
      border-radius: 4px; padding: 10px 12px; font-size: 13px;
    }
    .form-actions { display: flex; justify-content: flex-end; gap: 10px; }
    .btn-primary {
      background: #0f172a; color: #fff; border: none; border-radius: 5px;
      padding: 10px 20px; font-size: 13px; font-weight: 600; cursor: pointer;
    }
    .btn-primary:disabled { background: #94a3b8; cursor: not-allowed; }
    .btn-secondary {
      background: #fff; color: #374151; border: 1px solid #d1d5db; border-radius: 5px;
      padding: 10px 16px; font-size: 13px; cursor: pointer; text-decoration: none;
    }
  `],
})
export class ConsultationComponent implements OnInit {
  patientId = input<string>('');
  private fb         = inject(FormBuilder);
  private consultApi = inject(ConsultationApiService);
  private patientApi = inject(PatientApiService);
  private vitalsApi  = inject(VitalsApiService);
  private notify     = inject(NotificationService);
  private router     = inject(Router);

  readonly loading = signal(false);
  readonly error   = signal<string | null>(null);
  readonly patient = signal<any | null>(null);
  readonly vitals  = signal<any | null>(null);

  form = this.fb.group({
    chiefComplaint: ['', Validators.required],
    diagnoses:      this.fb.array([]),
    prescriptions:  this.fb.array([]),
    notes:          [''],
    labOrders:      [''],
  });

  get diagnoses()    { return this.form.get('diagnoses') as FormArray; }
  get prescriptions(){ return this.form.get('prescriptions') as FormArray; }

  ngOnInit() {
    const pid = this.patientId();
    if (pid) {
      this.patientApi.getById(pid).subscribe(p => this.patient.set(p));
      this.vitalsApi.getLatest(pid).subscribe(v => this.vitals.set(v));
    }
  }

  addDiagnosis() {
    this.diagnoses.push(this.fb.group({ code: [''], name: [''] }));
  }
  removeDiagnosis(i: number) { this.diagnoses.removeAt(i); }

  addPrescription() {
    this.prescriptions.push(this.fb.group({
      drug: [''], dose: [''], frequency: [''], duration: [''], instructions: ['']
    }));
  }
  removePrescription(i: number) { this.prescriptions.removeAt(i); }

  inv(f: string): boolean {
    const c = this.form.get(f);
    return !!(c?.invalid && c?.touched);
  }

  calcAge(dob: string): number {
    return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    const v = this.form.getRawValue();
    const payload = {
      ...v,
      patientId: this.patientId(),
      labOrders: v.labOrders ? v.labOrders.split(',').map((l: string) => l.trim()) : [],
    };
    this.consultApi.createForPatient(payload as any).subscribe({
      next: () => {
        this.notify.show('Consultation saved', 'success');
        this.router.navigate(['/doctor/queue']);
      },
      error: (e) => { this.error.set(e?.error?.message ?? 'Save failed'); this.loading.set(false); },
    });
  }
}
