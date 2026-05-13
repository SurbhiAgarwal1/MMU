import { Injectable, signal, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { fromEvent, merge } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

export interface SyncOperation {
  id: string;
  url: string;
  method: string;
  body: unknown;
  headers: Record<string, string | null>;
  timestamp: string;
  retryCount: number;
}

const DB_NAME = 'mmu_offline_queue';
const DB_VERSION = 1;
const STORE_NAME = 'operations';
const MAX_RETRIES = 5;

@Injectable({ providedIn: 'root' })
export class SyncQueueService {
  private http = inject(HttpClient);
  private _queue = signal<SyncOperation[]>([]);

  readonly queue = this._queue.asReadonly();
  readonly pendingCount = signal(0);

  private online = toSignal(
    merge(fromEvent(window, 'online'), fromEvent(window, 'offline')),
    { initialValue: null }
  );

  constructor() {
    this.loadFromIDB();
    effect(() => {
      this.online(); // track
      if (navigator.onLine && this._queue().length > 0) {
        this.flush();
      }
    });
  }

  enqueue(op: SyncOperation): void {
    this._queue.update((q) => [...q, op]);
    this.pendingCount.update((c) => c + 1);
    this.persistToIDB(op);
  }

  private async flush(): Promise<void> {
    const ops = [...this._queue()];
    for (const op of ops) {
      try {
        await this.execute(op);
        this._queue.update((q) => q.filter((o) => o.id !== op.id));
        this.pendingCount.update((c) => Math.max(0, c - 1));
        await this.removeFromIDB(op.id);
      } catch {
        if (op.retryCount >= MAX_RETRIES) {
          this._queue.update((q) => q.filter((o) => o.id !== op.id));
          await this.removeFromIDB(op.id);
          console.error(`[SyncQueue] Dropped operation ${op.id} after ${MAX_RETRIES} retries`);
        } else {
          this._queue.update((q) =>
            q.map((o) => (o.id === op.id ? { ...o, retryCount: o.retryCount + 1 } : o))
          );
        }
      }
    }
  }

  private execute(op: SyncOperation): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.http
        .request(op.method, op.url, { body: op.body })
        .subscribe({ next: resolve, error: reject });
    });
  }

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  private async persistToIDB(op: SyncOperation): Promise<void> {
    const db = await this.openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(op);
  }

  private async removeFromIDB(id: string): Promise<void> {
    const db = await this.openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
  }

  private async loadFromIDB(): Promise<void> {
    const db = await this.openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => {
      const ops = req.result as SyncOperation[];
      this._queue.set(ops);
      this.pendingCount.set(ops.length);
    };
  }
}
