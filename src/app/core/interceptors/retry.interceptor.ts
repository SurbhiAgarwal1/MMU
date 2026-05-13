import { HttpInterceptorFn } from '@angular/common/http';
import { retry, timer } from 'rxjs';

const RETRY_METHODS = ['GET'];
const MAX_RETRIES = 2;
const INITIAL_DELAY_MS = 1000;

export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  if (!RETRY_METHODS.includes(req.method)) {
    return next(req);
  }
  return next(req).pipe(
    retry({
      count: MAX_RETRIES,
      delay: (_, attempt) => timer(INITIAL_DELAY_MS * Math.pow(2, attempt - 1)),
    })
  );
};
