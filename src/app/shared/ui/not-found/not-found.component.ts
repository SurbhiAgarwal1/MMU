import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="nf-wrap">
      <div class="nf-code">404</div>
      <div class="nf-title">Page not found</div>
      <div class="nf-sub">The page you're looking for doesn't exist.</div>
      <a routerLink="/dashboard" class="nf-btn">← Back to Dashboard</a>
    </div>
  `,
  styles: [`
    .nf-wrap {
      min-height: 100vh; display: flex; flex-direction: column;
      align-items: center; justify-content: center; text-align: center;
      font-family: system-ui, sans-serif; background: #f8fafc;
    }
    .nf-code { font-size: 72px; font-weight: 800; color: #e5e7eb; line-height: 1; }
    .nf-title { font-size: 22px; font-weight: 700; color: #0f172a; margin: 8px 0 4px; }
    .nf-sub { font-size: 14px; color: #64748b; margin-bottom: 24px; }
    .nf-btn {
      background: #0f172a; color: #fff; text-decoration: none;
      border-radius: 5px; padding: 10px 20px; font-size: 13px; font-weight: 600;
    }
  `],
})
export class NotFoundComponent {}
