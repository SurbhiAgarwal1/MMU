import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../config/app.config.token';
import { User, AuthTokens } from '../state/models';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private http = inject(HttpClient);
  private base = inject(APP_CONFIG).apiUrl;

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/auth/login`, credentials);
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.base}/auth/logout`, {});
  }

  refreshToken(): Observable<AuthTokens> {
    const refreshToken = localStorage.getItem('mmu_refresh_token');
    return this.http.post<AuthTokens>(`${this.base}/auth/refresh`, {
      refreshToken,
    });
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.base}/auth/me`);
  }
}
