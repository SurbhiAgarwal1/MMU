import { Routes } from '@angular/router';

export const NURSE_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'queue',
    pathMatch: 'full',
  },
  {
    path: 'queue',
    loadComponent: () =>
      import('./nurse-queue.component').then((m) => m.NurseQueueComponent),
  },
  {
    path: 'vitals/:patientId',
    loadComponent: () =>
      import('./vitals/vitals-entry.component').then((m) => m.VitalsEntryComponent),
  },
];
