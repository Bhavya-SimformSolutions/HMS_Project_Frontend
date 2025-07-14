import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { DoctorsService } from '../../../../core/services/doctors.service';

@Component({
  selector: 'app-patient-bills-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-bills-list.component.html',
  styleUrls: ['./patient-bills-list.component.css']
})
export class PatientBillsListComponent implements OnInit, OnChanges {
  @Input() appointmentId!: number;
  @Input() appointmentStatus!: string;
  @Input() refreshTrigger: any;
  @Input() userRole: string = 'patient';

  @Output() billsChanged = new EventEmitter<void>();
  @Output() totalBillChange = new EventEmitter<number>();

  bills: any[] = [];
  payment: any = null;
  isLoading = false;
  error = '';
  
  totalBill = 0;
  discount = 0;
  payable = 0;
  amountPaid = 0;
  unpaidAmount = 0;
  finalized = false;
  paymentStatus = 'UNPAID';
  
  finalBillAccordionOpen = false;

  constructor(
    private appointmentService: AppointmentService,
    private doctorsService: DoctorsService
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
    this.isLoading = true;
    this.error = '';
    
    this.appointmentService.getPatientAppointmentBills(this.appointmentId).subscribe({
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

  private handleBillsData(payment: any): void {
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
    this.calculateTotals();
    this.isLoading = false;
  }

  calculateTotals(): void {
    this.totalBill = this.bills.reduce((sum, bill) => sum + (bill.total_cost || 0), 0);
    this.discount = 0; // Can be updated if discount logic is implemented
    this.payable = this.totalBill - (this.totalBill * this.discount / 100);
    this.amountPaid = 0; // Can be updated if payment tracking is implemented
    this.unpaidAmount = this.payable - this.amountPaid;
    
    this.totalBillChange.emit(this.totalBill);
  }

  toggleFinalBillAccordion(): void {
    this.finalBillAccordionOpen = !this.finalBillAccordionOpen;
  }

  onBillsChanged(): void {
    this.loadBills();
    this.billsChanged.emit();
  }
}
