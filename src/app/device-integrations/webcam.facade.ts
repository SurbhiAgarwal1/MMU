import { Injectable, signal } from '@angular/core';

export type CameraStatus = 'idle' | 'requesting' | 'active' | 'error' | 'denied';

@Injectable({ providedIn: 'root' })
export class WebcamFacade {
  readonly status = signal<CameraStatus>('idle');
  readonly stream = signal<MediaStream | null>(null);
  readonly error = signal<string | null>(null);

  async requestCamera(): Promise<void> {
    this.status.set('requesting');
    this.error.set(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
      });
      this.stream.set(mediaStream);
      this.status.set('active');
    } catch (err: unknown) {
      const isDenied = err instanceof DOMException && err.name === 'NotAllowedError';
      this.status.set(isDenied ? 'denied' : 'error');
      this.error.set(isDenied ? 'Camera permission denied.' : 'Camera unavailable.');
    }
  }

  captureFrame(videoElement: HTMLVideoElement): string | null {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(videoElement, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.92);
  }

  stopCamera(): void {
    const s = this.stream();
    if (s) {
      s.getTracks().forEach((t) => t.stop());
      this.stream.set(null);
    }
    this.status.set('idle');
  }
}
