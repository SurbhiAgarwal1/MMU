import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  computed,
} from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthStore } from '../../core/state/auth.store';
import { AuthApiService } from '../../core/api/auth.service';
import { SyncQueueService } from '../../offline-sync/sync-queue.service';
import { NotificationService } from '../../core/state/notification.service';
import { NotificationToastComponent } from '../../shared/ui/notification-toast/notification-toast.component';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  roles: string[];
}

const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: '⊞', roles: ['admin', 'doctor', 'nurse', 'pharmacist', 'lab_technician', 'receptionist'] },
  { path: '/registration', label: 'Registration', icon: '✚', roles: ['admin', 'receptionist', 'nurse', 'doctor'] },
  { path: '/nurse', label: 'Nurse Station', icon: '♥', roles: ['nurse', 'admin'] },
  { path: '/doctor', label: 'Doctor', icon: '✦', roles: ['doctor', 'admin'] },
  { path: '/pharmacy', label: 'Pharmacy', icon: '⬡', roles: ['pharmacist', 'admin'] },
  { path: '/lab', label: 'Laboratory', icon: '⊕', roles: ['lab_technician', 'admin'] },
  { path: '/admin', label: 'Admin', icon: '⚙', roles: ['admin'] },
];

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NotificationToastComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="shell">
      <!-- Sidebar -->
      <nav class="sidebar" [class.collapsed]="sidebarCollapsed()">
        <div class="sidebar-brand">
          <span class="brand-icon">⊕</span>
          @if (!sidebarCollapsed()) {
            <span class="brand-text">MMU Health</span>
          }
        </div>

        <ul class="nav-list">
          @for (item of visibleNavItems(); track item.path) {
            <li>
              <a
                [routerLink]="item.path"
                routerLinkActive="active"
                class="nav-link"
                [title]="item.label"
              >
                <span class="nav-icon">{{ item.icon }}</span>
                @if (!sidebarCollapsed()) {
                  <span class="nav-label">{{ item.label }}</span>
                }
              </a>
            </li>
          }
        </ul>

        <div class="sidebar-footer">
          @if (pendingSync() > 0) {
            <div class="sync-badge" [title]="pendingSync() + ' pending sync'">
              {{ pendingSync() }} offline
            </div>
          }
          <button class="toggle-btn" (click)="toggleSidebar()" [title]="sidebarCollapsed() ? 'Expand' : 'Collapse'">
            {{ sidebarCollapsed() ? '→' : '←' }}
          </button>
        </div>
      </nav>

      <!-- Main area -->
      <div class="main-area">
        <!-- Top bar -->
        <header class="topbar">
          <div class="topbar-left">
            <span class="page-title">{{ currentUser()?.fullName }}</span>
            <span class="role-badge">{{ currentUser()?.role }}</span>
          </div>
          <div class="topbar-right">
            @if (!isOnline()) {
              <span class="offline-indicator">● Offline</span>
            }
            <button class="logout-btn" (click)="logout()">Logout</button>
          </div>
        </header>

        <!-- Content -->
        <main class="content-area">
          <router-outlet />
        </main>
      </div>
    </div>

    <app-notification-toast />
  `,
  styles: [`
    .shell {
      display: flex;
      height: 100vh;
      background: #f5f4f1;
      font-family: 'IBM Plex Sans', system-ui, sans-serif;
    }
    .sidebar {
      width: 220px;
      background: #0f172a;
      color: #e2e8f0;
      display: flex;
      flex-direction: column;
      transition: width 0.2s ease;
      flex-shrink: 0;
    }
    .sidebar.collapsed { width: 56px; }
    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 20px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .brand-icon { font-size: 20px; color: #38bdf8; }
    .brand-text { font-size: 15px; font-weight: 700; letter-spacing: -0.02em; }
    .nav-list {
      list-style: none;
      padding: 8px 0;
      flex: 1;
      margin: 0;
    }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 16px;
      color: #94a3b8;
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      border-left: 2px solid transparent;
      transition: all 0.1s;
    }
    .nav-link:hover { background: rgba(255,255,255,0.06); color: #e2e8f0; }
    .nav-link.active { border-left-color: #38bdf8; background: rgba(56,189,248,0.1); color: #fff; }
    .nav-icon { font-size: 16px; min-width: 20px; text-align: center; }
    .sidebar-footer {
      padding: 12px;
      border-top: 1px solid rgba(255,255,255,0.08);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .sync-badge {
      background: #f59e0b;
      color: #1c1917;
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 3px;
      text-align: center;
    }
    .toggle-btn {
      background: rgba(255,255,255,0.08);
      border: none;
      color: #94a3b8;
      padding: 5px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }
    .main-area { flex: 1; display: flex; flex-direction: column; min-width: 0; }
    .topbar {
      background: #fff;
      border-bottom: 1px solid #e5e7eb;
      padding: 0 20px;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }
    .topbar-left { display: flex; align-items: center; gap: 10px; }
    .topbar-right { display: flex; align-items: center; gap: 12px; }
    .page-title { font-size: 14px; font-weight: 600; color: #111827; }
    .role-badge {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      background: #dbeafe;
      color: #1e40af;
      padding: 2px 7px;
      border-radius: 3px;
    }
    .offline-indicator { font-size: 11px; color: #ef4444; font-weight: 600; }
    .logout-btn {
      background: none;
      border: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 12px;
      padding: 5px 12px;
      border-radius: 4px;
      cursor: pointer;
    }
    .logout-btn:hover { background: #f9fafb; color: #111827; }
    .content-area { flex: 1; overflow-y: auto; padding: 20px; }
  `],
})
export class ShellComponent {
  private authStore = inject(AuthStore);
  private authApi = inject(AuthApiService);
  private router = inject(Router);
  private syncQueue = inject(SyncQueueService);

  readonly sidebarCollapsed = signal(false);
  readonly currentUser = this.authStore.user;
  readonly pendingSync = this.syncQueue.pendingCount;
  readonly isOnline = signal(navigator.onLine);

  readonly visibleNavItems = computed(() => {
    const role = this.authStore.userRole();
    return NAV_ITEMS.filter((item) => !role || item.roles.includes(role));
  });

  toggleSidebar(): void {
    this.sidebarCollapsed.update((v) => !v);
  }

  logout(): void {
    this.authApi.logout().subscribe({
      complete: () => {
        this.authStore.clearSession();
        this.router.navigate(['/login']);
      },
      error: () => {
        this.authStore.clearSession();
        this.router.navigate(['/login']);
      },
    });
  }
}
