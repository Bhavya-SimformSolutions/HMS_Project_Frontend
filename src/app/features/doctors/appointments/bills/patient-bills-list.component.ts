import { Component, Input, Output, EventEmitter, OnInit, SimpleChanges } from '@angular/core';
import { DoctorsService } from '../../../../core/services/doctors.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { EditFinalBillModalComponent } from './edit-final-bill-modal.component';
import { GenerateFinalBillModalComponent } from './generate-final-bill-modal.component';

@Component({
  selector: 'app-patient-bills-list',
  standalone: true,
  imports: [CommonModule, EditFinalBillModalComponent,GenerateFinalBillModalComponent],
  templateUrl: './patient-bills-list.component.html',
  styleUrls: ['./patient-bills-list.component.css']
})
export class PatientBillsListComponent implements OnInit {
  @Input() appointmentId!: number;
  @Input() refreshTrigger: any;
  @Input() userRole: string = '';
  @Input() appointmentStatus: string = '';
  @Output() addBill = new EventEmitter<void>();
  @Output() generateFinalBill = new EventEmitter<void>();
  @Output() billsChanged = new EventEmitter<void>();
  @Output() totalBillChange = new EventEmitter<number>();

  bills: any[] = [];
  payment: any = null;
  finalized = false;
  isLoading = false;
  error: string = '';
  paymentStatus: string = 'UNPAID';

  // Summary fields
  totalBill = 0;
  discount = 0;
  payable = 0;
  amountPaid = 0;
  unpaidAmount = 0;

  finalBillAccordionOpen = false;
  showEditFinalBillModal = false;
  canEditFinalBill = false;
  showGenerateFinalBillModal = false;

  constructor(private doctorsService: DoctorsService, private toastr: ToastrService) {}

  ngOnInit() {
    this.fetchBills();
    this.checkDoctorPermission();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['appointmentId'] && !changes['appointmentId'].firstChange) {
      this.fetchBills();
    }
    if (changes['refreshTrigger'] && !changes['refreshTrigger'].firstChange) {
      this.fetchBills();
    }
  }

  fetchBills() {
    this.isLoading = true;
    this.doctorsService.getBillsForAppointment(this.appointmentId).subscribe({
      next: (payment: any) => {
        this.payment = payment;
        if (payment && payment.bills) {
          this.bills = payment.bills;
          this.finalized = !!payment.finalized;
          this.discount = payment.discount || 0;
          this.payable = (payment.total_amount || 0) - ((payment.total_amount || 0) * (this.discount || 0) / 100);
          this.amountPaid = payment.amount_paid || 0;
          this.unpaidAmount = this.payable - this.amountPaid;
          this.paymentStatus = payment.status || 'UNPAID';
        } else {
          this.bills = [];
          this.finalized = false;
          this.discount = 0;
          this.payable = 0;
          this.amountPaid = 0;
          this.unpaidAmount = 0;
          this.paymentStatus = 'UNPAID';
        }
        this.calculateSummary();
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load bills.';
        this.isLoading = false;
      }
    });
  }

  calculateSummary() {
    this.totalBill = this.bills.reduce((sum, bill) => sum + bill.total_cost, 0);
    this.totalBillChange.emit(this.totalBill);
    // Discount, payable, amountPaid, unpaidAmount will be set after fetching payment info (to be implemented)
    this.discount = 0;
    this.payable = this.totalBill;
    this.amountPaid = 0;
    this.unpaidAmount = this.payable;
  }

  onAddBill() {
    if (this.finalized) return;
    this.addBill.emit();
  }

  // Remove Add Bill and Generate Final Bill buttons after finalization
  showBillActions(): boolean {
    return !this.finalized;
  }

  // After generating final bill, refresh data
  onGenerateFinalBill() {
    if (this.finalized) return;
    this.generateFinalBill.emit();
    // Wait for modal to close, then refresh
    setTimeout(() => this.fetchBills(), 500);
  }

  onClose() {
    // No longer used
  }

  onDeleteBill(bill: any) {
    if (this.finalized || this.paymentStatus !== 'UNPAID') return;
    if (!confirm('Are you sure you want to delete this bill?')) return;
    this.doctorsService.deleteBillFromAppointment(this.appointmentId, bill.id).subscribe({
      next: () => {
        this.toastr.success('Bill deleted successfully!');
        this.fetchBills();
        this.billsChanged.emit();
      },
      error: (err) => {
        if (err.error?.message?.includes('Final bill already generated')) {
          this.toastr.error('Cannot delete bill: Final bill already generated.');
          this.fetchBills();
        } else {
          this.toastr.error('Failed to delete bill.');
        }
      }
    });
  }

  addBillToAppointment(billData: any) {
    if (this.finalized) return;
    this.doctorsService.addBillToAppointment(this.appointmentId, billData).subscribe({
      next: () => {
        this.toastr.success('Bill added successfully!');
        this.fetchBills();
        this.billsChanged.emit();
      },
      error: (err) => {
        if (err.error?.message?.includes('Final bill already generated')) {
          this.toastr.error('Cannot add bill: Final bill already generated.');
          this.fetchBills();
        } else {
          this.toastr.error('Failed to add bill.');
        }
      }
    });
  }

  refreshBills() {
    this.fetchBills();
  }

  toggleFinalBillAccordion() {
    this.finalBillAccordionOpen = !this.finalBillAccordionOpen;
  }

  openEditFinalBillModal() {
    this.showEditFinalBillModal = true;
  }

  // Only allow adding bills if not finalized and appointment is SCHEDULED
  canAddBill(): boolean {
    return !this.finalized && this.paymentStatus === 'UNPAID' && this.appointmentStatus === 'SCHEDULED';
  }

  // Only allow generating final bill if not finalized, there are bills, and appointment is SCHEDULED
  canGenerateFinalBill(): boolean {
    return !this.finalized && this.bills.length > 0 && this.paymentStatus === 'UNPAID' && this.appointmentStatus === 'SCHEDULED';
  }

  // Only show edit icon for doctors and if finalized
  showEditIcon(): boolean {
    return this.canEditFinalBill && this.finalized;
  }

  // After editing final bill, refresh data
  onEditFinalBillModalClose(refresh: boolean) {
    this.showEditFinalBillModal = false;
    if (refresh) {
      this.fetchBills();
    }
  }

  // Listen for the close event from the generate final bill modal and refresh data if successful
  onGenerateFinalBillModalClose(refresh: boolean) {
    this.showGenerateFinalBillModal = false;
    if (refresh) {
      this.finalized = true; // Switch UI to summary immediately
      this.fetchBills();
    }
  }

  checkDoctorPermission() {
    // TODO: Replace with actual auth/role check
    // For now, assume doctor if userRole === 'doctor' (from a service or input)
    this.canEditFinalBill = this.userRole === 'doctor';
  }

  get finalBill() {
    return this.finalized ? this.payment : null;
  }

  // Call fetchBills after addBill or generateFinalBill
}