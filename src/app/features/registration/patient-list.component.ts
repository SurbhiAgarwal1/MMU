import { SlicePipe, UpperCasePipe, DatePipe } from '@angular/common';
import {
  Component, ChangeDetectionStrategy, signal, inject, OnInit, computed
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatientApiService } from '../../core/api/patient.service';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [RouterLink, FormsModule, SlicePipe, UpperCasePipe, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Patient Registration</h1>
          <p class="page-sub">{{ total() }} patients registered</p>
        </div>
        <a routerLink="/registration/new" class="btn-primary">✚ Register Patient</a>
      </div>

      <div class="search-bar">
        <input
          [(ngModel)]="searchQuery"
          (ngModelChange)="onSearch($event)"
          placeholder="Search by name, UHID or phone..."
          class="search-input"
        />
      </div>

      <div class="table-card">
        @if (loading()) {
          <div class="loading-row">Loading patients...</div>
        } @else if (patients().length === 0) {
          <div class="empty-row">No patients found.</div>
        } @else {
          <table class="data-table">
            <thead>
              <tr>
                <th>UHID</th>
                <th>Name</th>
                <th>Age / Gender</th>
                <th>Phone</th>
                <th>Blood Group</th>
                <th>Registered</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (p of patients(); track p.id) {
                <tr>
                  <td><span class="uhid">{{ p.uhid }}</span></td>
                  <td class="name-cell">{{ p.firstName }} {{ p.lastName }}</td>
                  <td>{{ calcAge(p.dob) }}y / {{ p.gender | slice:0:1 | uppercase }}</td>
                  <td>{{ p.phone }}</td>
                  <td>
                    @if (p.bloodGroup) {
                      <span class="blood-badge">{{ p.bloodGroup }}</span>
                    } @else { — }
                  </td>
                  <td class="date-cell">{{ p.createdAt | date:'dd MMM yyyy' }}</td>
                  <td>
                    <a [routerLink]="['/registration', p.id]" class="action-link">View →</a>
                  </td>
                </tr>
              }
            </tbody>
          </table>

          <div class="pagination">
            <button class="page-btn" [disabled]="page() === 1" (click)="prevPage()">← Prev</button>
            <span class="page-info">Page {{ page() }} of {{ totalPages() }}</span>
            <button class="page-btn" [disabled]="page() === totalPages()" (click)="nextPage()">Next →</button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 1100px; }
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 16px;
    }
    .page-title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 3px; }
    .page-sub { font-size: 13px; color: #64748b; margin: 0; }
    .btn-primary {
      background: #0f172a; color: #fff; border: none; border-radius: 5px;
      padding: 9px 16px; font-size: 13px; font-weight: 600;
      cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;
    }
    .search-bar { margin-bottom: 14px; }
    .search-input {
      width: 100%; max-width: 380px; border: 1px solid #d1d5db; border-radius: 5px;
      padding: 9px 12px; font-size: 13px; outline: none;
    }
    .search-input:focus { border-color: #0ea5e9; box-shadow: 0 0 0 3px rgba(14,165,233,0.1); }
    .table-card {
      background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;
    }
    .loading-row, .empty-row {
      padding: 40px; text-align: center; color: #94a3b8; font-size: 14px;
    }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th {
      background: #f8fafc; padding: 10px 14px; text-align: left;
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: .06em; color: #64748b; border-bottom: 1px solid #e5e7eb;
    }
    .data-table td {
      padding: 11px 14px; font-size: 13px; color: #374151;
      border-bottom: 1px solid #f1f5f9;
    }
    .data-table tr:last-child td { border: none; }
    .data-table tr:hover td { background: #f8fafc; }
    .uhid { font-family: monospace; font-size: 12px; color: #0ea5e9; font-weight: 600; }
    .name-cell { font-weight: 600; color: #0f172a; }
    .blood-badge {
      background: #fee2e2; color: #991b1b; font-size: 11px; font-weight: 700;
      padding: 2px 7px; border-radius: 3px;
    }
    .date-cell { color: #94a3b8; font-size: 12px; }
    .action-link { color: #0ea5e9; text-decoration: none; font-size: 12px; font-weight: 600; }
    .pagination {
      display: flex; align-items: center; gap: 12px; padding: 12px 16px;
      border-top: 1px solid #f1f5f9; justify-content: flex-end;
    }
    .page-btn {
      background: #fff; border: 1px solid #e5e7eb; border-radius: 4px;
      padding: 5px 12px; font-size: 12px; cursor: pointer; color: #374151;
    }
    .page-btn:disabled { opacity: .4; cursor: not-allowed; }
    .page-info { font-size: 12px; color: #64748b; }
  `],
})
export class PatientListComponent implements OnInit {
  private api = inject(PatientApiService);

  readonly loading  = signal(true);
  readonly patients = signal<any[]>([]);
  readonly total    = signal(0);
  readonly page     = signal(1);

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / 25)));

  searchQuery = '';
  private searchTimeout: any;

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.api.list({ page: this.page(), pageSize: 25, search: this.searchQuery }).subscribe({
      next: (res) => {
        this.patients.set(res.data ?? []);
        this.total.set(res.total ?? 0);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch(q: string) {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => { this.page.set(1); this.load(); }, 300);
  }

  prevPage() { if (this.page() > 1) { this.page.update(p => p - 1); this.load(); } }
  nextPage() { if (this.page() < this.totalPages()) { this.page.update(p => p + 1); this.load(); } }

  calcAge(dob: string): number {
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }
}
