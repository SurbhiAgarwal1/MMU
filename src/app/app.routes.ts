import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const APP_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layouts/shell/shell.component').then((m) => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'registration',
        loadChildren: () =>
          import('./features/registration/registration.routes').then(
            (m) => m.REGISTRATION_ROUTES
          ),
        canActivate: [roleGuard],
        data: { roles: ['admin', 'receptionist', 'nurse', 'doctor'] },
      },
      {
        path: 'nurse',
        loadChildren: () =>
          import('./features/nurse/nurse.routes').then(
            (m) => m.NURSE_ROUTES
          ),
        canActivate: [roleGuard],
        data: { roles: ['nurse', 'admin'] },
      },
      {
        path: 'doctor',
        loadChildren: () =>
          import('./features/doctor/doctor.routes').then(
            (m) => m.DOCTOR_ROUTES
          ),
        canActivate: [roleGuard],
        data: { roles: ['doctor', 'admin'] },
      },
      {
        path: 'pharmacy',
        loadChildren: () =>
          import('./features/pharmacy/pharmacy.routes').then(
            (m) => m.PHARMACY_ROUTES
          ),
        canActivate: [roleGuard],
        data: { roles: ['pharmacist', 'admin'] },
      },
      {
        path: 'lab',
        loadChildren: () =>
          import('./features/lab/lab.routes').then((m) => m.LAB_ROUTES),
        canActivate: [roleGuard],
        data: { roles: ['lab_technician', 'admin'] },
      },
      {
        path: 'admin',
        loadChildren: () =>
          import('./features/admin/admin.routes').then(
            (m) => m.ADMIN_ROUTES
          ),
        canActivate: [roleGuard],
        data: { roles: ['admin'] },
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/ui/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
];
