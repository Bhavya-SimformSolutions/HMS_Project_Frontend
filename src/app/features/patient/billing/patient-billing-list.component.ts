import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../../core/services/patient.service';
import { SidebarComponent } from '../../../layout/sidebar/sidebar.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-patient-billing-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './patient-billing-list.component.html',
  styleUrls: ['./patient-billing-list.component.css']
})
export class PatientBillingListComponent implements OnInit {
  bills: any[] = [];
  total = 0;
  page = 1;
  limit = 10;
  loading = false;
  searchTerm = '';
  filters: any = {};
  // Summary metrics
  totalPaid = 0;
  pendingPayments = 0;
  averageBillAmount = 0;
  // Filters
  selectedStatus = '';
  dateFrom = '';
  dateTo = '';

  constructor(private patientService: PatientService, private router: Router) {}

  ngOnInit() {
    this.loadBills();
  }

  loadBills() {
    this.loading = true;
    const filters = {
      status: this.selectedStatus,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo
    };
    this.patientService.getPatientBilling(this.page, this.limit, this.searchTerm, filters).subscribe({
      next: (res) => {
        this.bills = res.data;
        this.total = res.total;
        this.calculateMetrics();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  calculateMetrics() {
    this.totalPaid = this.bills.filter(b => b.status === 'PAID').reduce((sum, b) => sum + (b.total_amount || 0), 0);
    this.pendingPayments = this.bills.filter(b => b.status !== 'PAID').length;
    this.averageBillAmount = this.bills.length > 0 ? this.bills.reduce((sum, b) => sum + (b.total_amount || 0), 0) / this.bills.length : 0;
  }

  onPageChange(newPage: number) {
    if (newPage < 1 || newPage > this.totalPages) return;
    this.page = newPage;
    this.loadBills();
  }

  get totalPages() {
    return Math.ceil(this.total / this.limit);
  }

  onSearch(term: string) {
    this.searchTerm = term;
    this.page = 1;
    this.loadBills();
  }

  onFilterChange() {
    this.page = 1;
    this.loadBills();
  }

  clearFilters() {
    this.selectedStatus = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.searchTerm = '';
    this.onFilterChange();
  }

  goToAppointmentDetail(appointmentId: number) {
    this.router.navigate(['/patient/appointments', appointmentId]);
  }
}
