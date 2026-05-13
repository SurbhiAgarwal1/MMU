import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../config/app.config.token';
import { VitalSigns, ApiResponse } from '../state/models';

@Injectable()
export class VitalsApiService {
  private http = inject(HttpClient);
  private base = inject(APP_CONFIG).apiUrl;

  getByVisit(visitId: string): Observable<ApiResponse<VitalSigns>> {
    return this.http.get<ApiResponse<VitalSigns>>(`${this.base}/visits/${visitId}/vitals`);
  }

  save(visitId: string, vitals: Omit<VitalSigns, 'id'>): Observable<ApiResponse<VitalSigns>> {
    return this.http.post<ApiResponse<VitalSigns>>(`${this.base}/visits/${visitId}/vitals`, vitals);
  }

  update(vitalId: string, vitals: Partial<VitalSigns>): Observable<ApiResponse<VitalSigns>> {
    return this.http.patch<ApiResponse<VitalSigns>>(`${this.base}/vitals/${vitalId}`, vitals);
  }

  getHistory(patientId: string, limit = 10): Observable<ApiResponse<VitalSigns[]>> {
    return this.http.get<ApiResponse<VitalSigns[]>>(
      `${this.base}/patients/${patientId}/vitals`,
      { params: { limit: limit.toString() } }
    );
  }

  record(vitals: any): Observable<any> {
    return this.http.post<any>(`${this.base}/vitals`, vitals);
  }

  getLatest(patientId: string): Observable<any> {
    return this.http.get<any>(`${this.base}/patients/${patientId}/vitals/latest`);
  }
}
