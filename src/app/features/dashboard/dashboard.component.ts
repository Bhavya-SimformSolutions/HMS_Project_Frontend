import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { AuthService } from '../../core/services/auth.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { AdminService } from '../../core/services/admin.service';
import { DoctorDashboardStats, DoctorsService } from '../../core/services/doctors.service';
import { PatientService } from '../../core/services/patient.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  userRole: string = '';
  appointmentCount: number = 0;
  doctorStats: DoctorDashboardStats | null = null;
  loadingDoctorStats = false;
  doctorStatsError = '';

  // Patient dashboard properties
  patientStats: any = null;
  loadingPatientStats = false;
  patientStatsError = '';

  // Admin dashboard properties
  adminStats: any = null;
  loadingAdminStats = false;
  adminStatsError = '';

  // Chart properties for doctor dashboard
  chartData: any = null;
  chartType: ChartType = 'bar';
  chartOptions: any = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#374151',
          font: { family: 'inherit', size: 14, weight: 'bold' }
        }
      }
    },
    scales: {
      x: { ticks: { color: '#6b7280', font: { family: 'inherit', size: 12 } } },
      y: { ticks: { color: '#6b7280', font: { family: 'inherit', size: 12 } } }
    }
  };

  // Donut chart for completed vs total appointments
  donutChartData: any = null;
  donutChartType: ChartType = 'doughnut';
  donutChartOptions: any = {
    responsive: true,
    cutout: '70%',
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#374151',
          font: { family: 'inherit', size: 14, weight: 'bold' }
        }
      }
    }
  };

  recentAppointments: any[] = [];

  // Admin dashboard chart data
  adminBarChartData: any[] = [];
  adminBarChartLabels: string[] = [];
  adminDonutChartData: any = { labels: ['Scheduled', 'Pending', 'Completed', 'Cancelled'], datasets: [{ data: [], backgroundColor: ['#2563eb', '#f59e42', '#10b981', '#ef4444'], borderWidth: 0 }] };
  adminDonutChartLabels: string[] = ['Scheduled', 'Pending', 'Completed', 'Cancelled'];

  adminRevenueChartData: any = { labels: [], datasets: [{ data: [], backgroundColor: [], borderWidth: 0 }] };
  adminRevenueChartColors: string[] = [
    '#2563eb', '#f59e42', '#10b981', '#ef4444', '#a21caf', '#fbbf24', '#14b8a6', '#6366f1', '#e11d48', '#0e7490'
  ];

  constructor(
    public authService: AuthService,
    private appointmentService: AppointmentService,
    private doctorsService: DoctorsService,
    private patientService: PatientService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getRole();
    if (this.userRole === 'DOCTOR') {
      this.loadDoctorDashboardStats();
    } else if (this.userRole === 'PATIENT') {
      this.loadPatientDashboardStats();
    } else if (this.userRole === 'ADMIN') {
      this.loadAdminDashboardStats();
    } else {
      this.loadAppointmentCount();
    }
  }

  loadAppointmentCount(): void {
    this.appointmentService.getAppointmentCount().subscribe({
      next: (response) => {
        this.appointmentCount = response.data.count;
      },
      error: (error) => {
        console.error('Error fetching appointment count:', error);
      },
    });
  }

  loadDoctorDashboardStats(): void {
    this.loadingDoctorStats = true;
    this.doctorStatsError = '';
    this.doctorsService.getDoctorDashboardStats().subscribe({
      next: (stats) => {
        this.doctorStats = stats;
        this.loadingDoctorStats = false;
        // Prepare bar chart data
        this.chartData = {
          labels: stats.appointmentsByMonth.map((m: any) => m.month),
          datasets: [
            {
              label: 'Appointment',
              data: stats.appointmentsByMonth.map((m: any) => m.appointments),
              backgroundColor: '#2563eb',
              borderRadius: 6
            },
            {
              label: 'Completed',
              data: stats.appointmentsByMonth.map((m: any) => m.completed),
              backgroundColor: '#10b981',
              borderRadius: 6
            }
          ]
        };
        // Prepare donut chart data
        this.donutChartData = {
          labels: ['Appointments', 'Completed'],
          datasets: [
            {
              data: [stats.totalAppointments - stats.totalConsultations, stats.totalConsultations],
              backgroundColor: ['#111827', '#2563eb'],
              borderWidth: 0
            }
          ]
        };
        // Store recent appointments
        this.recentAppointments = stats.recentAppointments;
      },
      error: (error) => {
        this.doctorStatsError = 'Failed to load doctor dashboard stats.';
        this.loadingDoctorStats = false;
        console.error('Error fetching doctor dashboard stats:', error);
      },
    });
  }

  loadPatientDashboardStats(): void {
    this.loadingPatientStats = true;
    this.patientStatsError = '';
    this.patientService.getPatientDashboardStats().subscribe({
      next: (stats) => {
        this.patientStats = stats;
        this.loadingPatientStats = false;
      },
      error: (error) => {
        this.patientStatsError = 'Failed to load patient dashboard stats.';
        this.loadingPatientStats = false;
        console.error('Error fetching patient dashboard stats:', error);
      },
    });
  }

  loadAdminDashboardStats(): void {
    this.loadingAdminStats = true;
    this.adminStatsError = '';
    this.adminService.getAdminDashboardStats().subscribe({
      next: (stats) => {
        this.adminStats = stats;
        // Prepare bar chart data
        this.adminBarChartLabels = stats.appointmentsByMonth.map((m: any) => m.month);
        this.adminBarChartData = [
          { label: 'Scheduled', data: stats.appointmentsByMonth.map((m: any) => m.SCHEDULED), backgroundColor: '#2563eb' },
          { label: 'Pending', data: stats.appointmentsByMonth.map((m: any) => m.PENDING), backgroundColor: '#f59e42' },
          { label: 'Completed', data: stats.appointmentsByMonth.map((m: any) => m.COMPLETED), backgroundColor: '#10b981' },
          { label: 'Cancelled', data: stats.appointmentsByMonth.map((m: any) => m.CANCELLED), backgroundColor: '#ef4444' },
        ];
        // Prepare donut chart data (appointments by status)
        this.adminDonutChartData = {
          labels: ['Scheduled', 'Pending', 'Completed', 'Cancelled'],
          datasets: [
            {
              data: [
                stats.appointmentsByStatus.SCHEDULED,
                stats.appointmentsByStatus.PENDING,
                stats.appointmentsByStatus.COMPLETED,
                stats.appointmentsByStatus.CANCELLED,
              ],
              backgroundColor: ['#2563eb', '#f59e42', '#10b981', '#ef4444'],
              borderWidth: 0,
            },
          ],
        };
        // Prepare revenue by service chart data
        this.adminRevenueChartData = {
          labels: stats.revenueByService.map((s: any) => s.serviceName),
          datasets: [
            {
              data: stats.revenueByService.map((s: any) => s.revenue),
              backgroundColor: this.adminRevenueChartColors.slice(0, stats.revenueByService.length),
              borderWidth: 0,
            },
          ],
        };
        this.loadingAdminStats = false;
      },
      error: (error) => {
        this.adminStatsError = 'Failed to load admin dashboard stats.';
        this.loadingAdminStats = false;
        console.error('Error fetching admin dashboard stats:', error);
      },
    });
  }
} 