import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { SidebarComponent } from '../../../../layout/sidebar/sidebar.component';
import { Appointment } from '../../../../shared/models/appointment.model';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { DoctorsService } from '../../../../core/services/doctors.service';
import { ToastrService } from 'ngx-toastr';
import { Diagnosis } from '../../../../shared/models/appointment.model';
import { PatientBillsListComponent } from '../bills/patient-bills-list.component';
import { PatientChartsComponent } from '../charts/patient-charts.component';
import { AuthService } from '../../../../core/services/auth.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-patient-appointment-full-detail',
  standalone: true,
  imports: [
    CommonModule, 
    SidebarComponent, 
    RouterModule,
    PatientBillsListComponent,
    PatientChartsComponent
  ],
  templateUrl: './patient-appointment-full-detail.component.html',
  styleUrls: ['./patient-appointment-full-detail.component.css'],
})
export class PatientAppointmentFullDetailComponent implements OnInit {
  appointment: Appointment | null = null;
  isLoading = true;
  activeTab: string = 'vitals';
  diagnosisList: Diagnosis[] = [];
  isDiagnosisLoading = false;
  billsTotal = 0;
  billsRefreshTrigger: any = null;
  userRole: string = 'PATIENT';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private appointmentService: AppointmentService,
    private doctorService: DoctorsService,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getRole();
    const appointmentId = this.route.snapshot.paramMap.get('id');
    if (appointmentId) {
      this.loadAppointmentDetails(+appointmentId);
      this.loadDiagnosis(+appointmentId);
    }
  }

  loadAppointmentDetails(id: number): void {
    this.isLoading = true;
    this.appointmentService.getAppointmentById(id).subscribe({
      next: (response: any) => {
        this.appointment = response.data;
        // Load additional medical data if not included
        this.loadMedicalData(id);
        this.isLoading = false;
      },
      error: (err: any) => {
        this.isLoading = false;
        this.toastr.error('Failed to load appointment details.');
        console.error(err);
      },
    });
  }

  loadMedicalData(id: number): void {
    // Load vitals data separately if not included in appointment
    if (this.appointment && (!this.appointment.medical || !this.appointment.medical.vital_signs)) {
      // For simplicity, we'll let the individual components load their own data
      // The vitals will be handled by the template checking appointment.medical.vital_signs
      // which will show "No vital signs recorded" if empty - this is acceptable
    }
  }

  loadDiagnosis(id: number): void {
    this.isDiagnosisLoading = true;
    this.appointmentService.getPatientAppointmentDiagnosis(id).subscribe({
      next: (response: any) => {
        this.diagnosisList = response.data || response.diagnosis || response || [];
        this.isDiagnosisLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading diagnosis:', err);
        this.isDiagnosisLoading = false;
      },
    });
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`
    };
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  formatTime(time: string): string {
    if (!time) return '';
    const [hour, minute] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  onBillsChanged() {
    // Handle bills changes for read-only view
  }

  goBack(): void {
    this.router.navigate(['/patient/appointments']);
  }
}
