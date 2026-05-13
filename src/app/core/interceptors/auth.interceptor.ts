import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthStore } from '../state/auth.store';
import { AuthApiService } from '../api/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authStore = inject(AuthStore);
  const authApi = inject(AuthApiService);
  const router = inject(Router);

  const token = authStore.accessToken();
  if (!token || req.url.includes('/auth/')) {
    return next(req);
  }

  const authReq = addToken(req, token);

  return next(authReq).pipe(
    catchError((err) => {
      if (err.status === 401) {
        return authApi.refreshToken().pipe(
          switchMap((tokens) => {
            authStore.updateToken(tokens.accessToken);
            return next(addToken(req, tokens.accessToken));
          }),
          catchError((refreshErr) => {
            authStore.clearSession();
            router.navigate(['/login']);
            return throwError(() => refreshErr);
          })
        );
      }
      return throwError(() => err);
    })
  );
};

function addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
}
