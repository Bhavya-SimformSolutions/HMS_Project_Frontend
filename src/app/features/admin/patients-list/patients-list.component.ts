import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { SidebarComponent } from '../../../layout/sidebar/sidebar.component';

@Component({
  selector: 'app-patients-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './patients-list.component.html',
  styleUrls: ['./patients-list.component.css']
})
export class PatientsListComponent implements OnInit {
  patients: any[] = [];
  total = 0;
  page = 1;
  limit = 10;
  loading = false;
  searchTerm = '';
  sortOrder: 'asc' | 'desc' = 'desc';

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadPatients();
  }

  loadPatients() {
    this.loading = true;
    this.adminService.getPaginatedPatients(this.page, this.limit, this.searchTerm, this.sortOrder).subscribe({
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

  onSortChange(order: 'asc' | 'desc') {
    this.sortOrder = order;
    this.page = 1;
    this.loadPatients();
  }

  getPatientImgUrl(imgPath: string | undefined): string {
    if (!imgPath) return '';
    return imgPath.startsWith('http') ? imgPath : `http://localhost:3000${imgPath}`;
  }
} 