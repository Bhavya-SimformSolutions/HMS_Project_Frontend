import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { DoctorsService } from '../../../core/services/doctors.service';
import { SidebarComponent } from '../../../layout/sidebar/sidebar.component';

@Component({
  selector: 'app-billing-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './billing-overview.component.html',
  styleUrls: ['./billing-overview.component.css']
})
export class BillingOverviewComponent implements OnInit {
  bills: any[] = [];
  doctors: any[] = [];
  total = 0;
  page = 1;
  limit = 10;
  search = '';
  sortOrder: 'asc' | 'desc' = 'desc';
  loading = false;
  groupedPatients: any[] = [];
  openPatientId: string | null = null;

  // Advanced filters
  selectedDoctor: string = '';
  selectedStatus: string = '';
  dateFrom: string = '';
  dateTo: string = '';

  // Dashboard metrics
  totalRevenue = 0;
  pendingPayments = 0;
  totalPatients = 0;
  averageBillAmount = 0;

  constructor(private adminService: AdminService, private doctorsService: DoctorsService) {}

  ngOnInit() {
    this.loadDoctors();
    this.loadBills();
  }

  loadDoctors() {
    // Fetch all doctors with a high limit for dropdown
    this.doctorsService.getAllDoctors().subscribe((res: any) => {
      // If paginated, use res.doctors; if array, use res directly
      this.doctors = Array.isArray(res) ? res : res.doctors || [];
    }, err => {
      this.doctors = [];
    });
  }

  loadBills() {
    this.loading = true;
    const filters = {
      doctor: this.selectedDoctor,
      status: this.selectedStatus,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo
    };
    this.adminService.getPaginatedAdminBilling(this.page, this.limit, this.search, this.sortOrder, filters).subscribe((res: { bills: any[]; total: number; page: number; limit: number }) => {
      this.bills = res.bills;
      this.total = res.total;
      this.groupBillsByPatient();
      this.calculateMetrics();
      this.loading = false;
    }, () => { this.loading = false; });
  }

  groupBillsByPatient() {
    const map = new Map<string, any>();
    for (const bill of this.bills) {
      const patientId = bill.patient?.id;
      if (!patientId) continue;
      if (!map.has(patientId)) {
        map.set(patientId, { patient: bill.patient, bills: [], doctor: bill.doctor });
      }
      // Instead of pushing the parent bill, push all child bills with parent info
      for (const childBill of bill.bills) {
        map.get(patientId).bills.push({
          ...childBill,
          status: bill.status,
          billDate: bill.billDate,
          discount: bill.discount,
          doctor: bill.doctor
        });
      }
    }
    this.groupedPatients = Array.from(map.values());
  }

  calculateMetrics() {
    this.totalRevenue = this.bills.reduce((sum, bill) => sum + (bill.totalCost || 0), 0);
    this.pendingPayments = this.bills.filter(bill => bill.status === 'UNPAID').length;
    this.totalPatients = new Set(this.bills.map(bill => bill.patient?.id)).size;
    this.averageBillAmount = this.bills.length > 0 ? this.totalRevenue / this.bills.length : 0;
  }

  onPageChange(newPage: number) {
    if (newPage < 1 || newPage > this.totalPages) return;
    this.page = newPage;
    this.loadBills();
  }

  get totalPages() {
    return Math.ceil(this.total / this.limit);
  }

  onSearchChange() {
    this.page = 1;
    this.loadBills();
  }

  onSortChange(order: 'asc' | 'desc') {
    this.sortOrder = order;
    this.page = 1;
    this.loadBills();
  }

  onFilterChange() {
    this.page = 1;
    this.loadBills();
  }

  clearFilters() {
    this.selectedDoctor = '';
    this.selectedStatus = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.search = '';
    this.onFilterChange();
  }

  toggleAccordion(patientId: string) {
    if (this.openPatientId === patientId) {
      this.openPatientId = null;
    } else {
      this.openPatientId = patientId;
    }
  }

  isAccordionOpen(patientId: string): boolean {
    return this.openPatientId === patientId;
  }

  getTotalBill(bills: any[]): number {
    return bills.reduce((sum, b) => sum + (b.totalCost || 0), 0);
  }

  getDiscount(group: any): number {
    return group.bills[0]?.discount || 0;
  }

  getPayable(group: any): number {
    const total = this.getTotalBill(group.bills);
    const discount = this.getDiscount(group);
    return total - (total * discount / 100);
  }

  getPatientImgUrl(img: string | null | undefined): string {
    if (!img) return '/assets/default-avatar.png';
    if (img.startsWith('http')) return img;
    return 'http://localhost:3000' + img;
  }
}
