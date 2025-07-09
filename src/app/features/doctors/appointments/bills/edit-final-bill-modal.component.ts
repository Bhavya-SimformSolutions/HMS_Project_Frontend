import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorsService } from '../../../../core/services/doctors.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-edit-final-bill-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-final-bill-modal.component.html'
})
export class EditFinalBillModalComponent implements OnInit {
  @Input() payment: any;
  @Input() bills: any[] = [];
  @Output() close = new EventEmitter<boolean>();

  editableBills: any[] = [];
  discount: number = 0;
  billDate: string = '';
  isSubmitting = false;
  errorMessage = '';
  services: any[] = [];
  originalBillIds: number[] = [];

  constructor(private doctorsService: DoctorsService, private toastr: ToastrService) {}

  ngOnInit() {
    this.discount = this.payment?.discount || 0;
    this.billDate = this.payment?.bill_date ? this.payment.bill_date.split('T')[0] : '';
    this.editableBills = this.bills.map(bill => ({
      ...bill,
      service_date: bill.service_date ? (typeof bill.service_date === 'string' ? bill.service_date.split('T')[0] : new Date(bill.service_date).toISOString().split('T')[0]) : '',
      touched: false
    }));
    this.originalBillIds = this.bills.map(bill => bill.id);
    this.doctorsService.getAllServices().subscribe(services => {
      this.services = services;
    });
  }

  addBillRow() {
    this.editableBills.push({ service_id: null, quantity: 1, service_date: '', unit_cost: 0, total_cost: 0, service: null, touched: false });
  }

  removeBillRow(index: number) {
    if (this.editableBills.length === 1) return;
    this.editableBills.splice(index, 1);
  }

  updateBillTotal(bill: any) {
    if (bill.service_id) {
      const service = this.services.find(s => s.id === bill.service_id);
      if (service) {
        bill.unit_cost = service.price;
        bill.total_cost = service.price * (bill.quantity || 1);
      }
    }
  }

  onServiceChange(bill: any) {
    this.updateBillTotal(bill);
  }

  onServiceBlur(bill: any) {
    bill.touched = true;
  }

  async onSave() {
    // Validation
    if (!this.billDate) {
      this.errorMessage = 'Bill date is required.';
      return;
    }
    for (const bill of this.editableBills) {
      if (!bill.service_id) {
        this.errorMessage = 'All bills must have a service selected.';
        return;
      }
      if (!bill.quantity || bill.quantity < 1) {
        this.errorMessage = 'Quantity must be at least 1.';
        return;
      }
      if (!bill.service_date) {
        this.errorMessage = 'Service date is required.';
        return;
      }
    }
    this.isSubmitting = true;
    try {
      // 1. Update final bill summary (discount, bill_date)
      await this.doctorsService.editFinalBillSummary(this.payment.appointment_id, {
        discount: this.discount,
        bill_date: this.billDate
      }).toPromise();
      // 2. Update each bill (add, edit)
      const updatePromises = this.editableBills.map(bill => {
        if (bill.id) {
          // Existing bill: PATCH
          return this.doctorsService.editBillInAppointment(this.payment.appointment_id, bill.id, {
            service_id: bill.service_id,
            quantity: bill.quantity,
            service_date: bill.service_date
          }).toPromise();
        } else {
          // New bill: POST
          return this.doctorsService.addBillToAppointment(this.payment.appointment_id, {
            service_id: bill.service_id,
            quantity: bill.quantity,
            service_date: bill.service_date
          }).toPromise();
        }
      });
      // 3. Delete removed bills
      const currentIds = this.editableBills.filter(b => b.id).map(b => b.id);
      const deletedIds = this.originalBillIds.filter(id => !currentIds.includes(id));
      for (const id of deletedIds) {
        await this.doctorsService.deleteBillFromAppointment(this.payment.appointment_id, id).toPromise();
      }
      await Promise.all(updatePromises);
      this.isSubmitting = false;
      this.toastr.success('Final bill updated successfully!');
      this.close.emit(true);
    } catch (err: any) {
      this.isSubmitting = false;
      this.errorMessage = err?.error?.message || 'Failed to update final bill.';
    }
  }

  onCancel() {
    this.close.emit(false);
  }
} 