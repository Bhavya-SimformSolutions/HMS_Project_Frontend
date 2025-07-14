import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../../core/services/patient.service';
import { SidebarComponent } from '../../../layout/sidebar/sidebar.component';
import { DoctorsService, Doctor } from '../../../core/services/doctors.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-patient-prescriptions-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './patient-prescriptions-list.component.html',
  styleUrls: ['./patient-prescriptions-list.component.css']
})
export class PatientPrescriptionsListComponent implements OnInit {
  prescriptions: any[] = [];
  total = 0;
  page = 1;
  limit = 10;
  loading = false;
  searchTerm = '';
  filters: any = {};
  doctors: Doctor[] = [];
  selectedDoctor: string = '';
  dateFrom: string = '';
  dateTo: string = '';

  constructor(private patientService: PatientService, private doctorsService: DoctorsService, private router: Router) {}

  ngOnInit() {
    this.loadDoctors();
    this.loadPrescriptions();
  }

  loadDoctors() {
    this.doctorsService.getDoctorsForPatient().subscribe({
      next: (doctors) => { this.doctors = doctors || []; },
      error: () => { this.doctors = []; }
    });
  }

  loadPrescriptions() {
    this.loading = true;
    // Build filters
    const filters: any = {};
    if (this.selectedDoctor) filters.doctorId = this.selectedDoctor;
    if (this.dateFrom) filters.dateFrom = this.dateFrom;
    if (this.dateTo) filters.dateTo = this.dateTo;
    this.patientService.getPatientPrescriptions(this.page, this.limit, this.searchTerm, filters).subscribe({
      next: (res) => {
        this.prescriptions = res.data;
        this.total = res.total;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onPageChange(newPage: number) {
    if (newPage < 1 || newPage > this.totalPages) return;
    this.page = newPage;
    this.loadPrescriptions();
  }

  get totalPages() {
    return Math.ceil(this.total / this.limit);
  }

  onSearch(term: string) {
    this.searchTerm = term;
    this.page = 1;
    this.loadPrescriptions();
  }

  onFilterChange() {
    this.page = 1;
    this.loadPrescriptions();
  }

  goToAppointmentDetail(appointmentId: number) {
    if (!appointmentId) return;
    this.router.navigate(['/patient/appointments', appointmentId]);
  }

  clearFilters() {
    this.selectedDoctor = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.searchTerm = '';
    this.page = 1;
    this.loadPrescriptions();
  }

  getDoctorAvatar(doctor: any): string {
    if (!doctor) return '';
    if (doctor.img) return doctor.img.startsWith('http') ? doctor.img : `http://localhost:3000${doctor.img}`;
    return '';
  }

  getDoctorInitials(doctor: any): string {
    if (!doctor || !doctor.name) return '';
    const parts = doctor.name.split(' ');
    return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
  }
}
