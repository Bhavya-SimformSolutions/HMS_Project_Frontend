import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Appointment, CreateAppointmentData, Doctor } from '../../shared/models/appointment.model';


@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private apiUrl = `${environment.apiUrl}/patient/appointments`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // Get all appointments for the logged-in patient
  getAppointments(): Observable<ApiResponse<Appointment[]>> {
    return this.http.get<ApiResponse<Appointment[]>>(this.apiUrl, {
      headers: this.getAuthHeaders(),
    });
  }

  // Get a specific appointment by ID
  getAppointmentById(id: number): Observable<ApiResponse<Appointment>> {
    return this.http.get<ApiResponse<Appointment>>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Create a new appointment
  createAppointment(
    data: CreateAppointmentData
  ): Observable<ApiResponse<Appointment>> {
    return this.http.post<ApiResponse<Appointment>>(this.apiUrl, data, {
      headers: this.getAuthHeaders(),
    });
  }

  // Get the count of appointments for the logged-in patient
  getAppointmentCount(): Observable<ApiResponse<{ count: number }>> {
    return this.http.get<ApiResponse<{ count: number }>>(
      `${this.apiUrl}/count`,
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  // Update appointment status
  updateAppointmentStatus(
    id: number,
    status: 'PENDING' | 'SCHEDULED' | 'CANCELLED' | 'COMPLETED',
    reason?: string
  ): Observable<ApiResponse<Appointment>> {
    return this.http.patch<ApiResponse<Appointment>>(
      `${this.apiUrl}/${id}/status`,
      { status, reason },
      { headers: this.getAuthHeaders() }
    );
  }

  getDoctors(): Observable<ApiResponse<Doctor[]>> {
    return this.http.get<ApiResponse<Doctor[]>>(`${this.apiUrl}/doctors`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Get all appointments for the logged-in doctor
  getDoctorAppointments(): Observable<ApiResponse<Appointment[]>> {
    return this.http.get<ApiResponse<Appointment[]>>(`${environment.apiUrl}/doctor/appointments`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Patient-specific methods to get appointment details with nested data
  // Note: These use patient endpoints - if they don't exist on backend, they will fallback gracefully
  getPatientAppointmentBills(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/bills`, {
      headers: this.getAuthHeaders(),
    });
  }

  getPatientAppointmentDiagnosis(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/diagnosis`, {
      headers: this.getAuthHeaders(),
    });
  }

  getPatientAppointmentVitals(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/vitals`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Get full appointment details with medical data (patient view)
  getPatientAppointmentWithMedical(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/full`, {
      headers: this.getAuthHeaders(),
    });
  }
}