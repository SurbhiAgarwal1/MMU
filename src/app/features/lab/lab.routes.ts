import { Routes } from '@angular/router';

export const LAB_ROUTES: Routes = [
  { path: '', redirectTo: 'pending', pathMatch: 'full' },
  {
    path: 'pending',
    loadComponent: () =>
      import('./lab-pending.component').then((m) => m.LabPendingComponent),
  },
  {
    path: 'order/:patientId',
    loadComponent: () =>
      import('./lab-pending.component').then((m) => m.LabPendingComponent),
  },
];
