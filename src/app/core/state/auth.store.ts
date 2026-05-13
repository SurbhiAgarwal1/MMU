import { Injectable, computed, signal } from '@angular/core';
import { User, AuthTokens } from './models';

const ACCESS_TOKEN_KEY = 'mmu_access_token';
const REFRESH_TOKEN_KEY = 'mmu_refresh_token';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private _user = signal<User | null>(this.loadUser());
  private _accessToken = signal<string | null>(
    sessionStorage.getItem(ACCESS_TOKEN_KEY)
  );

  // Public readonly signals
  readonly user = this._user.asReadonly();
  readonly accessToken = this._accessToken.asReadonly();
  readonly isAuthenticated = computed(() => !!this._user() && !!this._accessToken());
  readonly userRole = computed(() => this._user()?.role ?? null);
  readonly userPermissions = computed(() => this._user()?.permissions ?? []);

  setSession(user: User, tokens: AuthTokens): void {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    localStorage.setItem('mmu_user', JSON.stringify(user));
    this._user.set(user);
    this._accessToken.set(tokens.accessToken);
  }

  updateToken(accessToken: string): void {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    this._accessToken.set(accessToken);
  }

  clearSession(): void {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem('mmu_user');
    this._user.set(null);
    this._accessToken.set(null);
  }

  hasPermission(permission: string): boolean {
    return this.userPermissions().includes(permission);
  }

  hasRole(role: string): boolean {
    return this.userRole() === role;
  }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem('mmu_user');
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}
