import { Injectable, signal } from '@angular/core';

export type RecorderStatus = 'idle' | 'requesting' | 'recording' | 'stopped' | 'error';

@Injectable({ providedIn: 'root' })
export class AudioRecorderFacade {
  readonly status = signal<RecorderStatus>('idle');
  readonly audioBlob = signal<Blob | null>(null);
  readonly durationMs = signal(0);
  readonly error = signal<string | null>(null);

  private mediaRecorder: MediaRecorder | null = null;
  private chunks: BlobPart[] = [];
  private startTime = 0;
  private timerRef: ReturnType<typeof setInterval> | null = null;

  async startRecording(): Promise<void> {
    this.status.set('requesting');
    this.error.set(null);
    this.chunks = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.chunks.push(e.data);
      };
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'audio/webm' });
        this.audioBlob.set(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      this.mediaRecorder.start(250);
      this.startTime = Date.now();
      this.timerRef = setInterval(() => {
        this.durationMs.set(Date.now() - this.startTime);
      }, 100);
      this.status.set('recording');
    } catch {
      this.status.set('error');
      this.error.set('Microphone access denied or unavailable.');
    }
  }

  stopRecording(): void {
    if (this.mediaRecorder?.state === 'recording') {
      this.mediaRecorder.stop();
    }
    if (this.timerRef) {
      clearInterval(this.timerRef);
      this.timerRef = null;
    }
    this.status.set('stopped');
  }

  reset(): void {
    this.audioBlob.set(null);
    this.durationMs.set(0);
    this.status.set('idle');
  }
}
