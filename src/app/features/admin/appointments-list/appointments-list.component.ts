import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { SidebarComponent } from '../../../layout/sidebar/sidebar.component';

@Component({
  selector: 'app-appointments-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './appointments-list.component.html',
  // styleUrls: ['./appointments-list.component.css']
})
export class AppointmentsListComponent implements OnInit {
  appointments: any[] = [];
  total = 0;
  page = 1;
  limit = 10;
  loading = false;
  searchTerm = '';
  statusFilter = '';
  scheduledCount = 0;
  pendingCount = 0;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.loading = true;
    this.adminService.getPaginatedAppointments(this.page, this.limit, this.searchTerm, this.statusFilter).subscribe({
      next: (res) => {
        this.appointments = res.appointments;
        this.total = res.total;
        // Update status counts
        this.scheduledCount = this.appointments.filter(a => a.status === 'SCHEDULED').length;
        this.pendingCount = this.appointments.filter(a => a.status === 'PENDING').length;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onPageChange(newPage: number) {
    if (newPage < 1 || newPage > this.totalPages) return;
    this.page = newPage;
    this.loadAppointments();
  }

  get totalPages() {
    return Math.ceil(this.total / this.limit);
  }

  onSearch(term: string) {
    this.searchTerm = term;
    this.page = 1;
    this.loadAppointments();
  }

  onStatusChange(status: string) {
    this.statusFilter = status;
    this.page = 1;
    this.loadAppointments();
  }
}