import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../core/services/appointment.service';
import { ToastrService } from 'ngx-toastr';
import { SidebarComponent } from '../../../layout/sidebar/sidebar.component';
import { AppointmentFormComponent } from './appointment-form/appointment-form.component';
import { AuthService } from '../../../core/services/auth.service';
import { AppointmentDetailComponent } from "./appointment-detail/appointment-detail.component";
import { Appointment } from '../../../shared/models/appointment.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, AppointmentFormComponent, AppointmentDetailComponent],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  searchTerm: string = '';
  statusFilter: string = '';
  isBookingModalOpen: boolean = false;
  selectedAppointment: Appointment | null = null;
  isLoading: boolean = true;
  activeActionMenu: number | null = null;
  showCancelConfirmation: boolean = false;
  appointmentToCancel: Appointment | null = null;

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading = true;
    this.appointmentService.getAppointments().subscribe({
      next: (response) => {
        this.appointments = response.data;
        this.filterAppointments();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.toastr.error('Failed to load appointments');
        this.isLoading = false;
      }
    });
  }

  filterAppointments(): void {
    let filtered = this.appointments;

    // Apply status filter
    if (this.statusFilter) {
      filtered = filtered.filter(appointment => appointment.status === this.statusFilter);
    }

    // Apply search filter
    if (this.searchTerm) {
      const searchTermLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(appointment => 
        appointment.doctor.name.toLowerCase().includes(searchTermLower) ||
        appointment.type.toLowerCase().includes(searchTermLower) ||
        appointment.status.toLowerCase().includes(searchTermLower)
      );
    }

    this.filteredAppointments = filtered;
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.filterAppointments();
  }

  toggleActionMenu(appointmentId: number): void {
    this.activeActionMenu = this.activeActionMenu === appointmentId ? null : appointmentId;
  }

  closeActionMenu(): void {
    this.activeActionMenu = null;
  }

  openBookingModal(): void {
    this.isBookingModalOpen = true;
  }

  closeBookingModal(): void {
    this.isBookingModalOpen = false;
  }

  onAppointmentBooked(): void {
    this.closeBookingModal();
    this.loadAppointments();
    this.toastr.success('Appointment booked successfully!');
  }

  viewAppointment(appointmentId: number): void {
    this.closeActionMenu();
    this.router.navigate(['/patient/appointments', appointmentId]);
  }

  closeViewModal(): void {
    this.selectedAppointment = null;
    document.body.style.overflow = 'auto';
  }

  cancelAppointment(appointment: Appointment): void {
    this.appointmentToCancel = appointment;
    this.showCancelConfirmation = true;
    this.closeActionMenu();
    document.body.style.overflow = 'hidden';
  }

  confirmCancelAppointment(): void {
    if (this.appointmentToCancel) {
      this.appointmentService.updateAppointmentStatus(this.appointmentToCancel.id, 'CANCELLED').subscribe({
        next: () => {
          this.toastr.success('Appointment cancelled successfully');
          this.loadAppointments();
          this.closeCancelConfirmation();
        },
        error: (error) => {
          console.error('Error cancelling appointment:', error);
          this.toastr.error('Failed to cancel appointment');
        }
      });
    }
  }

  closeCancelConfirmation(): void {
    this.showCancelConfirmation = false;
    this.appointmentToCancel = null;
    document.body.style.overflow = 'auto';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatTime(time: string): string {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'SCHEDULED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getInitials(patient: any): string {
    return (patient.first_name[0] + patient.last_name[0]).toUpperCase();
  }

  getAppointmentCountByStatus(status: string): number {
    return this.filteredAppointments.filter(appointment => appointment.status === status).length;
  }
}