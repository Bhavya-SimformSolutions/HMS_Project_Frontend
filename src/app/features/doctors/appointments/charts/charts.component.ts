import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VitalsService } from '../../../../core/services/vitals.service';
import { BloodPressureChartComponent } from './blood-pressure-chart/blood-pressure-chart.component';
import { HeartRateChartComponent } from './heart-rate-chart/heart-rate-chart.component';

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [CommonModule, BloodPressureChartComponent, HeartRateChartComponent],
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css']
})
export class ChartsComponent implements OnInit {
  @Input() appointmentId!: number;
  vitals: any[] = [];
  loading = true;
  error = '';

  constructor(private vitalsService: VitalsService) {}

  ngOnInit(): void {
    if (this.appointmentId) {
      this.vitalsService.getDoctorVitalsByAppointmentId(this.appointmentId).subscribe({
        next: (res: any) => {
          this.vitals = res.vitals || [];
          this.loading = false;
        },
        error: (err: any) => {
          console.error('Error loading vitals:', err);
          this.error = 'Failed to load vitals';
          this.loading = false;
        }
      });
    }
  }
}