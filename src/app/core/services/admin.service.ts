import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private adminUrl = `${environment.apiUrl}/admin/services`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getServices(): Observable<any> {
    return this.http.get<any>(this.adminUrl, {
      headers: this.getAuthHeaders()
    });
  }

  addService(data: { service_name: string; price: number; description: string }): Observable<any> {
    return this.http.post<any>(this.adminUrl, data, {
      headers: this.getAuthHeaders()
    });
  }

  getAdminDashboardStats(): Observable<any> {
    return this.http.get<any>('http://localhost:3000/admin/dashboard/stats', {
      headers: this.getAuthHeaders(),
    });
  }

  getPaginatedPatients(page: number, limit: number, search?: string, sort?: 'asc' | 'desc') {
    let url = `${environment.apiUrl}/admin/patients?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (sort) url += `&sort=${sort}`;
    return this.http.get<any>(url, { headers: this.getAuthHeaders() });
  }

  getPaginatedAppointments(page: number, limit: number, search?: string, status?: string) {
    let url = `${environment.apiUrl}/admin/appointments?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (status) url += `&status=${status}`;
    return this.http.get<any>(url, { headers: this.getAuthHeaders() });
  }

  getPaginatedAdminBilling(page: number = 1, limit: number = 10, search: string = '', sortOrder: 'asc' | 'desc' = 'desc', filters?: any) {
    const params: any = { page, limit, sortOrder };
    if (search) params.search = search;
    if (filters?.doctor) params.doctor = filters.doctor;
    if (filters?.status) params.status = filters.status;
    if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters?.dateTo) params.dateTo = filters.dateTo;
    return this.http.get<{ bills: any[]; total: number; page: number; limit: number }>(
      `${environment.apiUrl}/admin/billing`,
      { headers: this.getAuthHeaders(), params }
    );
  }
} 