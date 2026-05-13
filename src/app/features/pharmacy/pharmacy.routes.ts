import { Routes } from '@angular/router';

export const PHARMACY_ROUTES: Routes = [
  { path: '', redirectTo: 'dispense', pathMatch: 'full' },
  {
    path: 'dispense',
    loadComponent: () =>
      import('./pharmacy-dispense.component').then((m) => m.PharmacyDispenseComponent),
  },
  {
    path: 'dispense/:patientId',
    loadComponent: () =>
      import('./pharmacy-dispense.component').then((m) => m.PharmacyDispenseComponent),
  },
];
