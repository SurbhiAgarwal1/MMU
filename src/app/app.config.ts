import {
  ApplicationConfig,
  provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withViewTransitions,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import {
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { APP_ROUTES } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { retryInterceptor } from './core/interceptors/retry.interceptor';
import { offlineInterceptor } from './core/interceptors/offline.interceptor';
import { APP_CONFIG } from './core/config/app.config.token';
import { environment } from '../environments/environment';
import { PatientApiService } from './core/api/patient.service';
import { VitalsApiService } from './core/api/vitals.service';
import { ConsultationApiService } from './core/api/consultation.service';
import { VisitApiService } from './core/api/visit.service';
import { mockInterceptor } from './core/interceptors/mock.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),

    provideRouter(
      APP_ROUTES,
      withComponentInputBinding(),
      withViewTransitions(),
      withPreloading(PreloadAllModules)
    ),

    provideHttpClient(
      withInterceptors([
        mockInterceptor,
        authInterceptor,
        retryInterceptor,
        offlineInterceptor,
        errorInterceptor,
      ])
    ),

    provideAnimationsAsync(),

    { provide: APP_CONFIG, useValue: environment },

    // Domain services — provided at root via app config
    PatientApiService,
    VitalsApiService,
    ConsultationApiService,
    VisitApiService,
  ],
};
