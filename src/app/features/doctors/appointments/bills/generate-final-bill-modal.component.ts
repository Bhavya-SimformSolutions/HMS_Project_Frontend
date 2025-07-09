import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DoctorsService } from '../../../../core/services/doctors.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-generate-final-bill-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './generate-final-bill-modal.component.html',
  styleUrls: ['./generate-final-bill-modal.component.css']
})
export class GenerateFinalBillModalComponent {
  @Input() appointmentId!: number;
  @Input() totalBill: number = 0;
  @Output() close = new EventEmitter<boolean>();

  discount: number = 0;
  billDate: string = '';
  isSubmitting = false;
  errorMessage = '';

  constructor(private doctorsService: DoctorsService) {}

  submit() {
    if (!this.billDate) {
      this.errorMessage = 'Bill date is required.';
      return;
    }
    this.isSubmitting = true;
    this.doctorsService.generateFinalBillForAppointment(this.appointmentId, {
      discount: this.discount,
      bill_date: this.billDate
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.close.emit(true);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to generate bill.';
      }
    });
  }

  onClose() {
    this.close.emit(false);
  }

  get payable(): number {
    const discountAmount = (this.totalBill * (this.discount || 0)) / 100;
    return this.totalBill - discountAmount;
  }
}