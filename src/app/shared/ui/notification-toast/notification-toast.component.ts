import {
  Component, ChangeDetectionStrategy, inject, computed
} from '@angular/core';
import { NotificationService } from '../../../core/state/notification.service';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (latest()) {
      <div class="toast" [class]="'toast--' + latest()!.type" role="alert" aria-live="polite">
        <span class="toast-icon">{{ icon() }}</span>
        <span class="toast-msg">{{ latest()!.message }}</span>
        <button class="toast-close" (click)="dismiss()">✕</button>
      </div>
    }
  `,
  styles: [`
    .toast {
      position: fixed; bottom: 20px; right: 20px; z-index: 9999;
      display: flex; align-items: center; gap: 10px;
      padding: 12px 16px; border-radius: 8px;
      font-size: 13px; font-weight: 500;
      box-shadow: 0 4px 20px rgba(0,0,0,0.18);
      max-width: 380px; animation: slideIn .2s ease;
      font-family: 'IBM Plex Sans', system-ui, sans-serif;
    }
    @keyframes slideIn {
      from { transform: translateX(16px); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }
    .toast--success { background: #0f172a; color: #fff; }
    .toast--error   { background: #991b1b; color: #fff; }
    .toast--warning { background: #92400e; color: #fff; }
    .toast--info    { background: #1e40af; color: #fff; }
    .toast-icon { font-size: 15px; }
    .toast-msg  { flex: 1; }
    .toast-close {
      background: rgba(255,255,255,0.15); border: none; color: inherit;
      width: 20px; height: 20px; border-radius: 3px; cursor: pointer;
      font-size: 10px; display: flex; align-items: center; justify-content: center;
    }
  `],
})
export class NotificationToastComponent {
  private ns = inject(NotificationService);

  readonly latest = computed(() => {
    const list = this.ns.notifications();
    return list.length > 0 ? list[list.length - 1] : null;
  });

  readonly icon = computed(() => {
    switch (this.latest()?.type) {
      case 'success': return '✓';
      case 'error':   return '✕';
      case 'warning': return '⚠';
      default:        return 'ℹ';
    }
  });

  dismiss(): void {
    const n = this.latest();
    if (n) this.ns.dismiss(n.id);
  }
}
