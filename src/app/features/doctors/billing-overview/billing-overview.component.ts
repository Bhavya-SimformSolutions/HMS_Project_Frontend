import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  total = 0;
  page = 1;
  limit = 10;
  search = '';
  sortOrder: 'asc' | 'desc' = 'desc';
  loading = false;
  groupedPatients: any[] = [];
  openPatientId: string | null = null;

  constructor(private doctorsService: DoctorsService) {}

  ngOnInit() {
    this.loadBills();
  }

  loadBills() {
    this.loading = true;
    this.doctorsService.getPaginatedDoctorBilling(this.page, this.limit, this.search, this.sortOrder).subscribe((res: { bills: any[]; total: number; page: number; limit: number }) => {
      this.bills = res.bills;
      this.total = res.total;
      // Group bills by patient
      const map = new Map<string, any>();
      for (const bill of this.bills) {
        const patientId = bill.patient?.id;
        if (!patientId) continue;
        if (!map.has(patientId)) {
          map.set(patientId, { patient: bill.patient, bills: [] });
        }
        map.get(patientId).bills.push(bill);
      }
      this.groupedPatients = Array.from(map.values());
      this.loading = false;
    }, () => { this.loading = false; });
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

  getDiscount(group: any): number {
    // Find the first bill with a discount (if any), fallback to 0
    return group.bills[0]?.discount || 0;
  }

  getPayable(group: any): number {
    const total = this.getTotalBill(group.bills);
    const discount = this.getDiscount(group);
    return total - (total * discount / 100);
  }

  getTotalBill(bills: any[]): number {
    return bills.reduce((sum, b) => sum + (b.totalCost || 0), 0);
  }

  getPatientImgUrl(img: string | null | undefined): string {
    if (!img) return '/assets/default-avatar.png';
    if (img.startsWith('http')) return img;
    return 'http://localhost:3000' + img;
  }
}
