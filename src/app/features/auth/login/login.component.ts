import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthApiService } from '../../../core/api/auth.service';
import { AuthStore } from '../../../core/state/auth.store';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="login-wrap">
      <div class="login-card">
        <div class="login-header">
          <div class="brand-mark">⊕</div>
          <h1>MMU Healthcare</h1>
          <p>Sign in to your account</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="login-form" novalidate>
          @if (apiError()) {
            <div class="error-banner" role="alert">{{ apiError() }}</div>
          }

          <div class="field">
            <label for="username">Username</label>
            <input
              id="username"
              type="text"
              formControlName="username"
              autocomplete="username"
              placeholder="Enter username"
              [class.invalid]="isInvalid('username')"
            />
            @if (isInvalid('username')) {
              <span class="field-error">Username is required</span>
            }
          </div>

          <div class="field">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              autocomplete="current-password"
              placeholder="Enter password"
              [class.invalid]="isInvalid('password')"
            />
            @if (isInvalid('password')) {
              <span class="field-error">Password is required</span>
            }
          </div>

          <button
            type="submit"
            class="submit-btn"
            [disabled]="loading()"
          >
            {{ loading() ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-wrap {
      min-height: 100vh;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'IBM Plex Sans', system-ui, sans-serif;
    }
    .login-card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 32px;
      width: 360px;
    }
    .login-header { text-align: center; margin-bottom: 24px; }
    .brand-mark { font-size: 32px; color: #0ea5e9; margin-bottom: 8px; }
    h1 { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 4px; }
    p { font-size: 13px; color: #64748b; margin: 0; }
    .login-form { display: flex; flex-direction: column; gap: 16px; }
    .error-banner {
      background: #fee2e2;
      color: #991b1b;
      border: 1px solid #fecaca;
      border-radius: 4px;
      padding: 10px 12px;
      font-size: 13px;
    }
    .field { display: flex; flex-direction: column; gap: 5px; }
    label { font-size: 12px; font-weight: 600; color: #374151; }
    input {
      border: 1px solid #d1d5db;
      border-radius: 5px;
      padding: 9px 12px;
      font-size: 14px;
      color: #111827;
      outline: none;
      transition: border-color 0.15s;
    }
    input:focus { border-color: #0ea5e9; box-shadow: 0 0 0 3px rgba(14,165,233,0.1); }
    input.invalid { border-color: #ef4444; }
    .field-error { font-size: 11px; color: #ef4444; }
    .submit-btn {
      background: #0f172a;
      color: #fff;
      border: none;
      border-radius: 5px;
      padding: 11px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
      margin-top: 4px;
    }
    .submit-btn:hover { background: #1e293b; }
    .submit-btn:disabled { background: #94a3b8; cursor: not-allowed; }
  `],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authApi = inject(AuthApiService);
  private authStore = inject(AuthStore);
  private router = inject(Router);

  readonly loading = signal(false);
  readonly apiError = signal<string | null>(null);

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.apiError.set(null);

    const { username, password } = this.form.getRawValue();
    this.authApi.login({ username: username!, password: password! }).subscribe({
      next: ({ user, tokens }) => {
        this.authStore.setSession(user, tokens);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.apiError.set(err?.error?.message ?? 'Invalid credentials.');
        this.loading.set(false);
      },
    });
  }
}
