import { InjectionToken } from '@angular/core';

export interface AppConfig {
  production: boolean;
  apiUrl: string;
  wsUrl?: string;
  appVersion: string;
  featureFlags: {
    useZardTable: boolean;
    useZardModal: boolean;
    useNewWorkarea: boolean;
    offlineSyncEnabled: boolean;
    webcamEnabled: boolean;
  };
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');
