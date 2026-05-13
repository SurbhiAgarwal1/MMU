import { Component, ChangeDetectionStrategy, signal, inject, OnInit, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { DatePipe } from '@angular/common';
import { PatientApiService } from '../../core/api/patient.service';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, TitleCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <div class="page-header">
        <a routerLink="/registration" class="back-link">← Patient List</a>
      </div>

      @if (loading()) {
        <div class="loading">Loading patient...</div>
      } @else if (patient()) {
        <div class="patient-layout">
          <div class="patient-card">
            <div class="patient-avatar">{{ patient()!.firstName[0] }}{{ patient()!.lastName[0] }}</div>
            <div class="patient-info">
              <h1 class="patient-name">{{ patient()!.firstName }} {{ patient()!.lastName }}</h1>
              <div class="uhid-row">
                <span class="uhid">{{ patient()!.uhid }}</span>
                <span class="blood-badge">{{ patient()!.bloodGroup || 'Unknown' }}</span>
              </div>
            </div>
          </div>

          <div class="detail-grid">
            <div class="detail-section">
              <div class="section-label">Personal Details</div>
              <div class="detail-row"><span class="dl">Gender</span><span class="dv">{{ patient()!.gender | titlecase }}</span></div>
              <div class="detail-row"><span class="dl">Date of Birth</span><span class="dv">{{ patient()!.dob | date:'dd MMM yyyy' }}</span></div>
              <div class="detail-row"><span class="dl">Phone</span><span class="dv">{{ patient()!.phone }}</span></div>
              <div class="detail-row"><span class="dl">Address</span><span class="dv">{{ patient()!.address || '—' }}</span></div>
            </div>
            <div class="detail-section">
              <div class="section-label">Clinical Info</div>
              <div class="detail-row">
                <span class="dl">Allergies</span>
                <span class="dv">
                  @if (patient()!.allergies?.length) {
                    @for (a of patient()!.allergies; track a) {
                      <span class="allergy-tag">{{ a }}</span>
                    }
                  } @else { None recorded }
                </span>
              </div>
              <div class="detail-row">
                <span class="dl">Registered</span>
                <span class="dv">{{ patient()!.createdAt | date:'dd MMM yyyy, hh:mm a' }}</span>
              </div>
            </div>
          </div>

          <div class="action-bar">
            <a [routerLink]="['/nurse/vitals', patient()!.id]" class="btn-action nurse">♥ Record Vitals</a>
            <a [routerLink]="['/doctor/consultation', patient()!.id]" class="btn-action doctor">✦ Consult</a>
            <a [routerLink]="['/lab/order', patient()!.id]" class="btn-action lab">⊕ Lab Order</a>
            <a [routerLink]="['/pharmacy/dispense', patient()!.id]" class="btn-action pharmacy">⬡ Pharmacy</a>
          </div>
        </div>
      } @else {
        <div class="loading">Patient not found.</div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 900px; }
    .page-header { margin-bottom: 16px; }
    .back-link { font-size: 13px; color: #0ea5e9; text-decoration: none; font-weight: 500; }
    .loading { padding: 40px; text-align: center; color: #94a3b8; font-size: 14px; }
    .patient-card {
      background: #fff; border: 1px solid #e5e7eb; border-radius: 8px;
      padding: 20px; display: flex; gap: 16px; align-items: center; margin-bottom: 14px;
    }
    .patient-avatar {
      width: 52px; height: 52px; background: #0f172a; color: #fff;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 18px; font-weight: 700; flex-shrink: 0;
    }
    .patient-name { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 6px; }
    .uhid-row { display: flex; gap: 8px; align-items: center; }
    .uhid { font-family: monospace; font-size: 13px; color: #0ea5e9; font-weight: 600; }
    .blood-badge {
      background: #fee2e2; color: #991b1b; font-size: 11px; font-weight: 700;
      padding: 2px 7px; border-radius: 3px;
    }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
    .detail-section {
      background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;
    }
    .section-label {
      font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em;
      color: #94a3b8; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9;
    }
    .detail-row { display: flex; gap: 12px; padding: 6px 0; border-bottom: 1px solid #f8fafc; font-size: 13px; }
    .detail-row:last-child { border: none; }
    .dl { color: #94a3b8; min-width: 110px; }
    .dv { color: #0f172a; font-weight: 500; flex: 1; display: flex; flex-wrap: wrap; gap: 4px; }
    .allergy-tag {
      background: #fef3c7; color: #92400e; font-size: 11px; font-weight: 600;
      padding: 2px 8px; border-radius: 3px;
    }
    .action-bar {
      display: flex; gap: 10px; flex-wrap: wrap;
    }
    .btn-action {
      padding: 10px 18px; border-radius: 5px; font-size: 13px; font-weight: 600;
      text-decoration: none; display: inline-flex; align-items: center; gap: 6px;
    }
    .nurse    { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
    .doctor   { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
    .lab      { background: #f5f3ff; color: #5b21b6; border: 1px solid #ddd6fe; }
    .pharmacy { background: #fff7ed; color: #9a3412; border: 1px solid #fed7aa; }
  `],
})
export class PatientDetailComponent implements OnInit {
  id = input.required<string>();
  private api = inject(PatientApiService);

  readonly loading = signal(true);
  readonly patient = signal<any | null>(null);

  ngOnInit() {
    this.api.getById(this.id()).subscribe({
      next: (p) => { this.patient.set(p); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
