import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { delay, of, throwError } from 'rxjs';

export const mockInterceptor: HttpInterceptorFn = (req, next) => {
  // Only intercept requests to our API
  if (!req.url.includes('/api/v1')) {
    return next(req);
  }

  const { url, method, body } = req;

  // --- Auth Mocks ---
  if (url.endsWith('/auth/login') && method === 'POST') {
    const { username, password } = body as any;
    if (username === 'admin' && password === 'admin') {
      return of(new HttpResponse({
        status: 200,
        body: {
          user: {
            id: 'u-1',
            username: 'admin',
            fullName: 'System Administrator',
            role: 'admin',
            permissions: ['*']
          },
          tokens: {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
            expiresIn: 3600
          }
        }
      })).pipe(delay(800));
    } else {
      return throwError(() => new HttpErrorResponse({
        status: 401,
        error: { message: 'Invalid username or password (use admin/admin)' }
      })).pipe(delay(800));
    }
  }

  // --- Patient Mocks ---
  if (url.endsWith('/patients') && method === 'GET') {
    return of(new HttpResponse({
      status: 200,
      body: {
        data: [
          { id: 'p-1', uhid: 'MMU-001', firstName: 'John', lastName: 'Doe', gender: 'male', phone: '1234567890', createdAt: new Date().toISOString() },
          { id: 'p-2', uhid: 'MMU-002', firstName: 'Jane', lastName: 'Smith', gender: 'female', phone: '0987654321', createdAt: new Date().toISOString() }
        ],
        total: 2
      }
    })).pipe(delay(500));
  }

  if (url.endsWith('/patients') && method === 'POST') {
    const body = req.body as any;
    return of(new HttpResponse({
      status: 201,
      body: {
        id: `p-${Math.floor(Math.random() * 1000)}`,
        uhid: `MMU-${Math.floor(Math.random() * 9000) + 1000}`,
        ...body,
        createdAt: new Date().toISOString()
      }
    })).pipe(delay(1000));
  }

  // --- Queue Mocks ---
  if (url.endsWith('/visits/nurse-queue') && method === 'GET') {
    return of(new HttpResponse({
      status: 200,
      body: [
        { id: 'v-1', patientId: 'p-1', patientName: 'John Doe', tokenNumber: 'N-101', status: 'registered' },
        { id: 'v-2', patientId: 'p-2', patientName: 'Jane Smith', tokenNumber: 'N-102', status: 'registered' }
      ]
    })).pipe(delay(500));
  }

  if (url.endsWith('/visits/doctor-queue') && method === 'GET') {
    return of(new HttpResponse({
      status: 200,
      body: [
        { id: 'v-3', patientId: 'p-3', patientName: 'Alice Johnson', tokenNumber: 'D-201', status: 'waiting_doctor' }
      ]
    })).pipe(delay(500));
  }

  // --- Vitals Mocks ---
  if (url.includes('/vitals') && method === 'POST') {
    return of(new HttpResponse({
      status: 201,
      body: { message: 'Vitals recorded successfully', status: 201 }
    })).pipe(delay(800));
  }

  // --- Consultation Mocks ---
  if (url.includes('/consultations') && method === 'POST') {
    return of(new HttpResponse({
      status: 201,
      body: { message: 'Consultation saved', status: 201 }
    })).pipe(delay(800));
  }

  if (url.includes('/prescriptions') && method === 'POST') {
    return of(new HttpResponse({
      status: 201,
      body: { message: 'Prescription added', status: 201 }
    })).pipe(delay(800));
  }

  // Default fallback (pass through)
  return next(req);
};
