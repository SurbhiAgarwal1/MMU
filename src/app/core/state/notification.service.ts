import { Injectable, signal, computed } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly notifications = signal<Notification[]>([]);
  readonly current = computed(() => {
    const list = this.notifications();
    return list.length > 0 ? list[list.length - 1] : null;
  });

  show(message: string, type: NotificationType = 'info', duration = 3500): void {
    this.push({ type, message, duration });
  }

  success(message: string, duration = 3000): void {
    this.push({ type: 'success', message, duration });
  }

  error(message: string, duration = 5000): void {
    this.push({ type: 'error', message, duration });
  }

  info(message: string, duration = 3000): void {
    this.push({ type: 'info', message, duration });
  }

  warning(message: string, duration = 4000): void {
    this.push({ type: 'warning', message, duration });
  }

  dismiss(id: string): void {
    this.notifications.update((list) => list.filter((n) => n.id !== id));
  }

  private push(n: Omit<Notification, 'id'>): void {
    const id = crypto.randomUUID();
    this.notifications.update((list) => [...list, { ...n, id }]);
    if (n.duration) {
      setTimeout(() => this.dismiss(id), n.duration);
    }
  }
}
