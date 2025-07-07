import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: 'root' })
export class VitalsService {
  private apiUrl = `${environment.apiUrl}/patient/appointments`;
  

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
      const token = localStorage.getItem('token');
      return new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });
    }

  getVitalsByAppointmentId(appointmentId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${appointmentId}/vitals`,{
      headers: this.getAuthHeaders(),
    });
  }
} 