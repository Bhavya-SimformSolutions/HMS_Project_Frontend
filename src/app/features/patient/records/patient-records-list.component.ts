import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../../core/services/patient.service';
import { SidebarComponent } from '../../../layout/sidebar/sidebar.component';
import { DoctorsService, Doctor } from '../../../core/services/doctors.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-patient-records-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './patient-records-list.component.html',
  styleUrls: ['./patient-records-list.component.css']
})
export class PatientRecordsListComponent implements OnInit {
  records: any[] = [];
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
    this.loadRecords();
  }

  loadDoctors() {
    this.doctorsService.getDoctorsForPatient().subscribe({
      next: (doctors) => { this.doctors = doctors || []; },
      error: () => { this.doctors = []; }
    });
  }

  loadRecords() {
    this.loading = true;
    // Build filters
    const filters: any = {};
    if (this.selectedDoctor) filters.doctorId = this.selectedDoctor;
    if (this.dateFrom) filters.dateFrom = this.dateFrom;
    if (this.dateTo) filters.dateTo = this.dateTo;
    this.patientService.getPatientRecords(this.page, this.limit, this.searchTerm, filters).subscribe({
      next: (res) => {
        this.records = res.data;
        this.total = res.total;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onPageChange(newPage: number) {
    if (newPage < 1 || newPage > this.totalPages) return;
    this.page = newPage;
    this.loadRecords();
  }

  get totalPages() {
    return Math.ceil(this.total / this.limit);
  }

  onSearch(term: string) {
    this.searchTerm = term;
    this.page = 1;
    this.loadRecords();
  }

  onFilterChange() {
    this.page = 1;
    this.loadRecords();
  }

  goToAppointmentDetail(appointmentId: string) {
    console.log('Navigating to appointment:', appointmentId);
    if (!appointmentId) return;
    this.router.navigate(['/patient/appointments', appointmentId]);
  }

  clearFilters() {
    this.selectedDoctor = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.searchTerm = '';
    this.page = 1;
    this.loadRecords();
  }

  getDoctorAvatar(doctor: any): string {
    // If doctor has img, return full URL, else return empty string
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
