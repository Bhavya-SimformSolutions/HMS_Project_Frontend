import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    gender: string;
  };
}

interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface PatientDetails{
  firstName: string;
  lastName: string;
  gender: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://localhost:3000/auth'; 
  private isAuthenticated: boolean = false; 
  private role: string = ''; 
  private patientDetails = new BehaviorSubject<PatientDetails | null>(null);

  constructor(private http:HttpClient) { 
    // Initialize authentication state from localStorage
    this.initializeAuthState();
  }

  // Initialize authentication state from localStorage
  private initializeAuthState(): void {
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('userRole');
    
    if (token && storedRole) {
      this.isAuthenticated = true;
      this.role = storedRole;
    }
  }

  //Login Method
  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, { email, password }).pipe(
      tap((response)=>{
        localStorage.setItem('token', response.token);
        localStorage.setItem('userRole', response.user.role);
        localStorage.setItem('userEmail', response.user.email);
        localStorage.setItem('userFirstName', response.user.firstName || '');
        localStorage.setItem('userLastName', response.user.lastName || '');
        this.isAuthenticated = true;
        this.role = response.user.role;
      })
    )
  }

  updatePatientDetails(details: PatientDetails): void {
    this.patientDetails.next(details);
  }

  getPatientDetails() : BehaviorSubject<PatientDetails | null>{
    return this.patientDetails;
  }

  //Register Method
  register(data: RegisterRequest) {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  // Method to check if the user is authenticated
  checkAuth(): boolean {
    return this.isAuthenticated;
  }

  // Method to set the user's role
  setRole(role: string): void {
    this.role = role;
    this.isAuthenticated = true;
    console.log('Role set to:', this.role);
  }
  
  // Method to get the user's role
  getRole(): string {
    return this.role;
  }

  // Method to logout
  logout(): void {
    this.isAuthenticated = false;
    this.role = '';
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userFirstName');
    localStorage.removeItem('userLastName');
  }

  // Get current user info from localStorage
  getCurrentUser() {
    const email = localStorage.getItem('userEmail') || '';
    const firstName = localStorage.getItem('userFirstName') || '';
    const lastName = localStorage.getItem('userLastName') || '';
    return { email, firstName, lastName };
  }
}
