import { Routes } from '@angular/router';

export const DOCTOR_ROUTES: Routes = [
  { path: '', redirectTo: 'queue', pathMatch: 'full' },
  {
    path: 'queue',
    loadComponent: () =>
      import('./doctor-queue.component').then((m) => m.DoctorQueueComponent),
  },
  {
    path: 'consultation/:patientId',
    loadComponent: () =>
      import('./consultation/consultation.component').then((m) => m.ConsultationComponent),
  },
];
