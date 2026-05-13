import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../config/app.config.token';
import { Visit, ApiResponse, PaginatedResponse } from '../state/models';

@Injectable()
export class VisitApiService {
  private http = inject(HttpClient);
  private base = inject(APP_CONFIG).apiUrl;

  getQueue(date?: string): Observable<PaginatedResponse<any>> {
    const params = date ? new HttpParams().set('date', date) : undefined;
    return this.http.get<PaginatedResponse<any>>(`${this.base}/visits/queue`, { params });
  }

  getNurseQueue(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/visits/nurse-queue`);
  }

  getDoctorQueue(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/visits/doctor-queue`);
  }

  getPendingPrescriptions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/prescriptions/pending`);
  }

  dispensePrescription(id: string): Observable<any> {
    return this.http.patch(`${this.base}/prescriptions/${id}/dispense`, {});
  }

  getPendingLabOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/lab-orders/pending`);
  }

  updateLabOrderStatus(orderId: string, status: string): Observable<any> {
    return this.http.patch(`${this.base}/lab-orders/${orderId}/status`, { status });
  }

  getById(visitId: string): Observable<ApiResponse<Visit>> {
    return this.http.get<ApiResponse<Visit>>(`${this.base}/visits/${visitId}`);
  }

  create(patientId: string, data: Partial<Visit>): Observable<ApiResponse<Visit>> {
    return this.http.post<ApiResponse<Visit>>(`${this.base}/visits`, { patientId, ...data });
  }

  updateStatus(visitId: string, status: Visit['status']): Observable<ApiResponse<Visit>> {
    return this.http.patch<ApiResponse<Visit>>(`${this.base}/visits/${visitId}/status`, { status });
  }
}
