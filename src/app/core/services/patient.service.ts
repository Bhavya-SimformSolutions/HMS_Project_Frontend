import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthService, PatientDetails } from './auth.service';

export interface PatientRegistrationData {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone: string;
  email: string;
  marital_status: string;
  address: string;
  emergency_contact_name: string;
  emergency_contact_number: string;
  relation: string;
  blood_group?: string;
  allergies?: string;
  medical_conditions?: string;
  medical_history?: string;
  insurance_provider?: string;
  insurance_number?: string;
  privacy_consent: boolean;
  service_consent: boolean;
  medical_consent: boolean;
  img?: string;
  colorCode?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private readonly apiUrl = 'http://localhost:3000/patient';

  constructor(private http: HttpClient, private authService: AuthService) {}

  /**
   * Gets the authorization headers with the token from localStorage.
   *
   * @returns An instance of HttpHeaders with the Authorization header.
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  /**
   * Registers a new patient with the provided data and optional image file.
   *
   * @param patientData - The patient's registration data.
   * @param imageFile - An optional image file for the patient's profile.
   * @returns An observable of the registration response.
   */
  registerPatient(
    patientData: PatientRegistrationData,
    imageFile?: File
  ): Observable<any> {
    const formData = this.createFormData(patientData, imageFile);

    return this.http
      .post(`${this.apiUrl}/register`, formData, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        tap((response: any) => {
          // Update the BehaviorSubject in AuthService with the registered patient details
          const patientData: PatientDetails = {
            firstName: response.patient.first_name,
            lastName: response.patient.last_name,
            gender: response.patient.gender,
          };
          this.authService.updatePatientDetails(patientData);
        }),
        catchError((error) => {
          console.error('Patient registration failed:', error);
          return of(null); // Return null in case of an error
        })
      );
  }

  /**
   * Checks if the patient is already registered.
   *
   * @returns An observable that emits `true` if the patient is registered, `false` otherwise.
   */
  checkPatientRegistration(): Observable<boolean> {
    return this.http
      .get<{ isRegistered: boolean }>(`${this.apiUrl}/check-registration`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map((response) => response.isRegistered),
        catchError((error) => {
          console.error('Error checking patient registration:', error);
          return of(false); // Return false in case of an error
        })
      );
  }

  /**
   * Creates a FormData object from the provided patient data and optional image file.
   *
   * @param patientData - The patient's registration data.
   * @param imageFile - An optional image file for the patient's profile.
   * @returns A FormData object containing the patient data and image file.
   */
  private createFormData(
    patientData: PatientRegistrationData,
    imageFile?: File
  ): FormData {
    const formData = new FormData();

    // Add all patient data fields to FormData
    Object.keys(patientData).forEach((key) => {
      const value = patientData[key as keyof PatientRegistrationData];
      if (value !== undefined) {
        formData.append(key, value as string);
      }
    });

    // Add image file if provided
    if (imageFile) {
      formData.append('img', imageFile);
    }

    return formData;
  }

  // Fetch patient profile
  getPatientProfile(): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/profile`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error('Error fetching patient profile:', error);
          return of(null); // Return null in case of an error
        })
      );
  }

  // Fetch medical history
  getMedicalHistory(): Observable<any> {
    // Return static medical history data since backend is not implemented
    const staticMedicalHistory = [
      {
        date: '2025-06-10',
        diagnosis: 'Hypertension',
        treatment: 'Lifestyle modification, medication',
        doctor: 'Dr. John Smith',
      },
      {
        date: '2025-05-20',
        diagnosis: 'Seasonal Allergy',
        treatment: 'Antihistamines',
        doctor: 'Dr. Emily Brown',
      },
    ];
    return of({ data: staticMedicalHistory });
  }

  // Fetch patient reviews
  getPatientReviews(): Observable<any> {
    // Return static reviews data since backend is not implemented
    const staticReviews = [
      {
        reviewer: 'Dr. John Smith',
        rating: 5,
        comment: 'Excellent patient, very cooperative and punctual.',
        date: '2025-07-01',
      },
      {
        reviewer: 'Dr. Emily Brown',
        rating: 4,
        comment: 'Good communication and follows instructions well.',
        date: '2025-06-15',
      },
    ];
    return of({ data: staticReviews });
  }

  getPatientDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard`, {
      headers: this.getAuthHeaders(),
    });
  }
}