import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorsService, Doctor } from '../../../core/services/doctors.service';
import { AddDoctorComponent } from '../add-doctor/add-doctor.component'; 
import { SidebarComponent } from '../../../layout/sidebar/sidebar.component';

@Component({
  selector: 'app-doctors-list',
  standalone: true,
  imports: [CommonModule, FormsModule, AddDoctorComponent, SidebarComponent],
  templateUrl: './doctors-list.component.html',
  styleUrls: ['./doctors-list.component.css']
})
export class DoctorsListComponent implements OnInit {
  doctors: (Doctor & { created_at?: string })[] = [];
  filteredDoctors: (Doctor & { created_at?: string })[] = [];
  search = '';
  showAddDoctor = false;
  total = 0;
  page = 1;
  limit = 10;
  sortOrder: 'asc' | 'desc' = 'desc';
  loading = false;

  constructor(private doctorsService: DoctorsService) {}

  ngOnInit() {
    this.loadDoctors();
  }

  loadDoctors() {
    this.loading = true;
    this.doctorsService.getPaginatedDoctors(this.page, this.limit, this.search, this.sortOrder).subscribe((res: { doctors: Doctor[]; total: number; page: number; limit: number }) => {
      this.doctors = res.doctors;
      this.total = res.total;
      this.filteredDoctors = res.doctors;
      this.loading = false;
    }, () => { this.loading = false; });
  }

  onPageChange(newPage: number) {
    if (newPage < 1 || newPage > this.totalPages) return;
    this.page = newPage;
    this.loadDoctors();
  }

  get totalPages() {
    return Math.ceil(this.total / this.limit);
  }

  onSearchChange() {
    this.page = 1;
    this.loadDoctors();
  }

  onSortChange(order: 'asc' | 'desc') {
    this.sortOrder = order;
    this.page = 1;
    this.loadDoctors();
  }

  openAddDoctor() {
    this.showAddDoctor = true;
  }

  closeAddDoctor(reload: boolean = false) {
    this.showAddDoctor = false;
    if (reload) this.loadDoctors();
  }
}