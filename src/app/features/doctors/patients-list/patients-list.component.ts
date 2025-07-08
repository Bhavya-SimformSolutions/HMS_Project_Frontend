import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorsService } from '../../../core/services/doctors.service';
import { SidebarComponent } from '../../../layout/sidebar/sidebar.component';

@Component({
  selector: 'app-doctor-patients-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './patients-list.component.html',
  styleUrls: ['./patients-list.component.css']
})
export class DoctorPatientsListComponent implements OnInit {
  patients: any[] = [];
  total = 0;
  page = 1;
  limit = 10;
  loading = false;
  searchTerm = '';
  sortOrder: 'asc' | 'desc' = 'desc'; // Not used but kept for UI consistency

  constructor(private doctorsService: DoctorsService) {}

  ngOnInit() {
    this.loadPatients();
  }

  loadPatients() {
    this.loading = true;
    this.doctorsService.getPaginatedDoctorPatients(this.page, this.limit, this.searchTerm).subscribe({
      next: (res) => {
        this.patients = res.patients;
        this.total = res.total;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onPageChange(newPage: number) {
    if (newPage < 1 || newPage > this.totalPages) return;
    this.page = newPage;
    this.loadPatients();
  }

  get totalPages() {
    return Math.ceil(this.total / this.limit);
  }

  onSearch(term: string) {
    this.searchTerm = term;
    this.page = 1;
    this.loadPatients();
  }

  getPatientImgUrl(imgPath: string | undefined): string {
    if (!imgPath) return '';
    return imgPath.startsWith('http') ? imgPath : `http://localhost:3000${imgPath}`;
  }

  onSortChange(order: 'asc' | 'desc') {
    this.sortOrder = order;
    this.page = 1;
    this.loadPatients();
  }
} 