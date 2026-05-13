import { InjectionToken } from '@angular/core';
import { environment } from '@env/environment';

export interface AppConfig {
  production: boolean;
  apiUrl: string;
  wsUrl: string;
  appVersion: string;
  featureFlags: Record<string, boolean>;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG', {
  providedIn: 'root',
  factory: () => environment,
});
