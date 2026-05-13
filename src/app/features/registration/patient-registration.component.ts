import {
  Component, ChangeDetectionStrategy, signal, inject
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PatientApiService } from '../../core/api/patient.service';
import { NotificationService } from '../../core/state/notification.service';

@Component({
  selector: 'app-patient-registration',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Patient Registration</h1>
          <p class="page-sub">Register a new patient into the system</p>
        </div>
        <a routerLink="/registration" class="btn-secondary">← Patient List</a>
      </div>

      <div class="form-card">
        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>

          <div class="form-section">
            <div class="section-label">Personal Information</div>
            <div class="form-grid">
              <div class="field">
                <label>First Name *</label>
                <input formControlName="firstName" placeholder="First name"
                  [class.invalid]="inv('firstName')" />
                @if (inv('firstName')) { <span class="err">Required</span> }
              </div>
              <div class="field">
                <label>Last Name *</label>
                <input formControlName="lastName" placeholder="Last name"
                  [class.invalid]="inv('lastName')" />
                @if (inv('lastName')) { <span class="err">Required</span> }
              </div>
              <div class="field">
                <label>Date of Birth *</label>
                <input type="date" formControlName="dob"
                  [class.invalid]="inv('dob')" />
                @if (inv('dob')) { <span class="err">Required</span> }
              </div>
              <div class="field">
                <label>Gender *</label>
                <select formControlName="gender" [class.invalid]="inv('gender')">
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                @if (inv('gender')) { <span class="err">Required</span> }
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="section-label">Contact & Clinical</div>
            <div class="form-grid">
              <div class="field">
                <label>Phone *</label>
                <input type="tel" formControlName="phone" placeholder="10-digit mobile"
                  [class.invalid]="inv('phone')" />
                @if (inv('phone')) { <span class="err">Valid 10-digit number required</span> }
              </div>
              <div class="field">
                <label>Blood Group</label>
                <select formControlName="bloodGroup">
                  <option value="">Unknown</option>
                  @for (bg of bloodGroups; track bg) {
                    <option [value]="bg">{{ bg }}</option>
                  }
                </select>
              </div>
              <div class="field full">
                <label>Address</label>
                <textarea formControlName="address" rows="2" placeholder="Full address"></textarea>
              </div>
              <div class="field full">
                <label>Known Allergies</label>
                <input formControlName="allergies" placeholder="e.g. Penicillin, Sulfa drugs (comma separated)" />
              </div>
            </div>
          </div>

          @if (error()) {
            <div class="error-banner" role="alert">{{ error() }}</div>
          }

          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="reset()">Reset</button>
            <button type="submit" class="btn-primary" [disabled]="loading()">
              {{ loading() ? 'Registering...' : 'Register Patient' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 800px; }
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 20px;
    }
    .page-title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 3px; }
    .page-sub { font-size: 13px; color: #64748b; margin: 0; }
    .form-card {
      background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px;
    }
    .form-section { margin-bottom: 24px; }
    .section-label {
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: .08em; color: #94a3b8; margin-bottom: 14px;
      padding-bottom: 8px; border-bottom: 1px solid #f1f5f9;
    }
    .form-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
    }
    .field { display: flex; flex-direction: column; gap: 4px; }
    .field.full { grid-column: 1 / -1; }
    label { font-size: 12px; font-weight: 600; color: #374151; }
    input, select, textarea {
      border: 1px solid #d1d5db; border-radius: 5px;
      padding: 9px 11px; font-size: 13px; color: #111827; outline: none;
      font-family: inherit; transition: border-color .15s;
    }
    input:focus, select:focus, textarea:focus {
      border-color: #0ea5e9; box-shadow: 0 0 0 3px rgba(14,165,233,0.1);
    }
    input.invalid, select.invalid { border-color: #ef4444; }
    .err { font-size: 11px; color: #ef4444; }
    .error-banner {
      background: #fee2e2; color: #991b1b; border: 1px solid #fecaca;
      border-radius: 4px; padding: 10px 12px; font-size: 13px; margin-bottom: 16px;
    }
    .form-actions {
      display: flex; justify-content: flex-end; gap: 10px;
      padding-top: 16px; border-top: 1px solid #f1f5f9;
    }
    .btn-primary {
      background: #0f172a; color: #fff; border: none;
      border-radius: 5px; padding: 10px 20px; font-size: 13px;
      font-weight: 600; cursor: pointer;
    }
    .btn-primary:disabled { background: #94a3b8; cursor: not-allowed; }
    .btn-secondary {
      background: #fff; color: #374151; border: 1px solid #d1d5db;
      border-radius: 5px; padding: 10px 16px; font-size: 13px;
      font-weight: 500; cursor: pointer; text-decoration: none;
      display: inline-flex; align-items: center;
    }
    .btn-secondary:hover { background: #f9fafb; }
  `],
})
export class PatientRegistrationComponent {
  private fb      = inject(FormBuilder);
  private api     = inject(PatientApiService);
  private notify  = inject(NotificationService);
  private router  = inject(Router);

  readonly loading = signal(false);
  readonly error   = signal<string | null>(null);

  bloodGroups = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

  form = this.fb.group({
    firstName:  ['', Validators.required],
    lastName:   ['', Validators.required],
    dob:        ['', Validators.required],
    gender:     ['', Validators.required],
    phone:      ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
    bloodGroup: [''],
    address:    [''],
    allergies:  [''],
  });

  inv(f: string): boolean {
    const c = this.form.get(f);
    return !!(c?.invalid && c?.touched);
  }

  reset(): void { this.form.reset(); this.error.set(null); }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set(null);
    const v = this.form.getRawValue();
    const payload = {
      ...v,
      allergies: v.allergies ? v.allergies.split(',').map((a: string) => a.trim()) : [],
    };
    this.api.register(payload as any).subscribe({
      next: (p) => {
        this.notify.show('Patient registered. UHID: ' + p.uhid, 'success');
        this.router.navigate(['/registration']);
      },
      error: (e) => {
        this.error.set(e?.error?.message ?? 'Registration failed.');
        this.loading.set(false);
      },
    });
  }
}
