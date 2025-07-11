import { Component, OnInit } from '@angular/core';
import { PatientService } from '../../../core/services/patient.service';
import { RouterLink } from '@angular/router';
import { SidebarComponent } from '../../../layout/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, SidebarComponent, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  profile: any = {};
  medicalHistory: any[] = [];
  reviews: any[] = [];
  quickLinks: any[] = [
    { name: 'Patient\'s Appointments', link: '/appointments' },
    { name: 'Medical Records', link: '/medical-records' },
    { name: 'Medical Bills', link: '/medical-bills' },
    { name: 'Dashboard', link: '/dashboard' },
    { name: 'Lab Test & Result', link: '/lab-test' },
    { name: 'Edit Information', link: '/edit-info' }
  ];

  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    this.loadProfile();
    this.loadMedicalHistory();
    this.loadReviews();
  }

  // Fetch patient profile
  loadProfile(): void {
    this.patientService.getPatientProfile().subscribe({
      next: (response) => {
        if (response && response.data) {
          const p = response.data;
          this.profile = {
            img: p.img || '',
            name: (p.first_name && p.last_name) ? `${p.first_name} ${p.last_name}` : '',
            email: p.email || '',
            gender: p.gender || '',
            dateOfBirth: p.date_of_birth || '',
            phoneNumber: p.phone || '',
            maritalStatus: p.marital_status || '',
            bloodGroup: p.blood_group || '',
            address: p.address || '',
            contactPerson: p.emergency_contact_name || '',
            emergencyContact: p.emergency_contact_number || '',
            lastVisit: p.updated_at || '',
            appointments: p.appointments || 0, // fallback if not present
          };
        } else {
          this.profile = {};
        }
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.profile = {};
      }
    });
  }

  // Fetch medical history
  loadMedicalHistory(): void {
    this.patientService.getMedicalHistory().subscribe({
      next: (response) => {
        this.medicalHistory = response.data;
      },
      error: (error) => {
        console.error('Error loading medical history:', error);
      }
    });
  }

  // Fetch patient reviews
  loadReviews(): void {
    this.patientService.getPatientReviews().subscribe({
      next: (response) => {
        this.reviews = response.data;
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
      }
    });
  }
}
