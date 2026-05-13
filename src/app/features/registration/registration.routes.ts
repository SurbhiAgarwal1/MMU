import { Routes } from '@angular/router';

export const REGISTRATION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./patient-list.component').then((m) => m.PatientListComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./patient-registration.component').then((m) => m.PatientRegistrationComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./patient-detail.component').then((m) => m.PatientDetailComponent),
  },
];
