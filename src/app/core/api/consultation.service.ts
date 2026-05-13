import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../config/app.config.token';
import { Consultation, Prescription, LabOrder, ApiResponse } from '../state/models';

@Injectable()
export class ConsultationApiService {
  private http = inject(HttpClient);
  private base = inject(APP_CONFIG).apiUrl;

  getByVisit(visitId: string): Observable<ApiResponse<Consultation>> {
    return this.http.get<ApiResponse<Consultation>>(`${this.base}/visits/${visitId}/consultation`);
  }

  create(visitId: string, data: Partial<Consultation>): Observable<ApiResponse<Consultation>> {
    return this.http.post<ApiResponse<Consultation>>(
      `${this.base}/visits/${visitId}/consultation`, data
    );
  }

  createForPatient(data: any): Observable<any> {
    return this.http.post<any>(`${this.base}/consultations`, data);
  }

  update(consultationId: string, data: Partial<Consultation>): Observable<ApiResponse<Consultation>> {
    return this.http.patch<ApiResponse<Consultation>>(
      `${this.base}/consultations/${consultationId}`, data
    );
  }

  addPrescription(consultationId: string, rx: Prescription): Observable<ApiResponse<Prescription>> {
    return this.http.post<ApiResponse<Prescription>>(
      `${this.base}/consultations/${consultationId}/prescriptions`, rx
    );
  }

  addLabOrder(consultationId: string, order: LabOrder): Observable<ApiResponse<LabOrder>> {
    return this.http.post<ApiResponse<LabOrder>>(
      `${this.base}/consultations/${consultationId}/lab-orders`, order
    );
  }
}
