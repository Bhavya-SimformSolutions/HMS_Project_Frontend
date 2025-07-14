import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { BloodPressureChartComponent } from '../../../doctors/appointments/charts/blood-pressure-chart/blood-pressure-chart.component';
import { HeartRateChartComponent } from '../../../doctors/appointments/charts/heart-rate-chart/heart-rate-chart.component';

@Component({
  selector: 'app-patient-charts',
  standalone: true,
  imports: [CommonModule, BloodPressureChartComponent, HeartRateChartComponent],
  templateUrl: './patient-charts.component.html',
  styleUrls: ['./patient-charts.component.css']
})
export class PatientChartsComponent implements OnInit {
  @Input() appointmentId!: number;
  vitals: any[] = [];
  loading = true;
  error = '';

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    if (this.appointmentId) {
      this.appointmentService.getPatientAppointmentVitals(this.appointmentId).subscribe({
        next: (res: any) => {
          this.vitals = res.vitals || res.data || [];
          this.loading = false;
        },
        error: (err: any) => {
          console.error('Error loading vitals:', err);
          this.error = 'Failed to load chart data';
          this.loading = false;
        }
      });
    }
  }
}
