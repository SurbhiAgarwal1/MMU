import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../config/app.config.token';
import { Patient, ApiResponse, PaginatedResponse } from '../state/models';

export interface PatientListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  q?: string;
}

@Injectable()
export class PatientApiService {
  private http = inject(HttpClient);
  private base = inject(APP_CONFIG).apiUrl;

  list(params: PatientListParams = {}): Observable<PaginatedResponse<Patient>> {
    const p: Record<string, string> = {};
    if (params.page)     p['page']     = String(params.page);
    if (params.pageSize) p['pageSize'] = String(params.pageSize);
    if (params.search)   p['q']        = params.search;
    return this.http.get<PaginatedResponse<Patient>>(`${this.base}/patients`, {
      params: new HttpParams({ fromObject: p }),
    });
  }

  search(params: PatientListParams): Observable<PaginatedResponse<Patient>> {
    return this.list(params);
  }

  getById(id: string): Observable<Patient> {
    return this.http.get<Patient>(`${this.base}/patients/${id}`);
  }

  getByUhid(uhid: string): Observable<ApiResponse<Patient>> {
    return this.http.get<ApiResponse<Patient>>(`${this.base}/patients/uhid/${uhid}`);
  }

  register(dto: any): Observable<Patient> {
    return this.http.post<Patient>(`${this.base}/patients`, dto);
  }

  create(dto: any): Observable<ApiResponse<Patient>> {
    return this.http.post<ApiResponse<Patient>>(`${this.base}/patients`, dto);
  }

  update(id: string, dto: any): Observable<ApiResponse<Patient>> {
    return this.http.patch<ApiResponse<Patient>>(`${this.base}/patients/${id}`, dto);
  }
}
