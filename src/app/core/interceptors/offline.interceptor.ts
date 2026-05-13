import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { SyncQueueService } from '../../offline-sync/sync-queue.service';

const OFFLINE_SAFE_METHODS = ['POST', 'PUT', 'PATCH'];

export const offlineInterceptor: HttpInterceptorFn = (req, next) => {
  const syncQueue = inject(SyncQueueService);

  if (!navigator.onLine && OFFLINE_SAFE_METHODS.includes(req.method)) {
    syncQueue.enqueue({
      id: crypto.randomUUID(),
      url: req.url,
      method: req.method,
      body: req.body,
      headers: req.headers.keys().reduce(
        (acc, key) => ({ ...acc, [key]: req.headers.get(key) }),
        {} as Record<string, string | null>
      ),
      timestamp: new Date().toISOString(),
      retryCount: 0,
    });
    return throwError(() => ({
      offline: true,
      message: 'Request queued for sync when online.',
    }));
  }

  return next(req);
};
