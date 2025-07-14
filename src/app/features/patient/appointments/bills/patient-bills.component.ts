import { Component, Input, Output, EventEmitter, OnInit, SimpleChanges } from '@angular/core';
import { DoctorsService } from '../../../../core/services/doctors.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-patient-bills',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-bills.component.html',
  styleUrls: ['./patient-bills.component.css']
})
export class PatientBillsComponent implements OnInit {
  @Input() appointmentId!: number;
  @Input() refreshTrigger: any;
  @Input() userRole: string = '';
  @Input() appointmentStatus: string = '';
  @Output() billsChanged = new EventEmitter<void>();
  @Output() totalBillChange = new EventEmitter<number>();

  bills: any[] = [];
  payment: any = null;
  finalized = false;
  isLoading = false;
  error: string = '';
  finalBillAccordionOpen = false;
  showEditFinalBillModal = false;
  showGenerateFinalBillModal = false;
  finalBill: any = null;

  // Computed values
  totalBill = 0;
  discount = 0;
  payable = 0;
  amountPaid = 0;
  unpaidAmount = 0;
  paymentStatus = 'UNPAID';

  constructor(
    private doctorsService: DoctorsService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadBills();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['refreshTrigger'] && !changes['refreshTrigger'].firstChange) {
      this.loadBills();
    }
  }

  loadBills(): void {
    if (!this.appointmentId) return;
    
    this.isLoading = true;
    this.doctorsService.getBillsForAppointment(this.appointmentId).subscribe({
      next: (response: any) => {
        this.bills = response.bills || [];
        this.payment = response.payment || null;
        this.finalized = !!this.payment?.finalized;
        this.calculateTotals();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading bills:', error);
        this.error = 'Failed to load bills';
        this.isLoading = false;
      }
    });
  }

  calculateTotals(): void {
    this.totalBill = this.bills.reduce((sum, bill) => sum + (bill.total_cost || 0), 0);
    
    if (this.payment) {
      this.discount = this.payment.discount || 0;
      this.payable = this.payment.total_amount - (this.payment.total_amount * this.discount / 100);
      this.amountPaid = this.payment.amount_paid || 0;
      this.unpaidAmount = this.payable - this.amountPaid;
      this.paymentStatus = this.unpaidAmount <= 0 ? 'PAID' : 'UNPAID';
    } else {
      this.payable = this.totalBill;
      this.unpaidAmount = this.totalBill;
      this.paymentStatus = 'UNPAID';
    }

    this.totalBillChange.emit(this.totalBill);
  }

  toggleFinalBillAccordion(): void {
    this.finalBillAccordionOpen = !this.finalBillAccordionOpen;
  }
}
