import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../state/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotificationService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 0) {
        notify.error('Network error. Check your connection.');
      } else if (err.status >= 500) {
        notify.error('Server error. Please try again.');
      } else if (err.status === 403) {
        notify.error('Access denied.');
      }
      // 401 handled by authInterceptor
      return throwError(() => err);
    })
  );
};
