 import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-blood-pressure-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './blood-pressure-chart.component.html',
  styleUrls: ['./blood-pressure-chart.component.css']
})
export class BloodPressureChartComponent implements OnChanges {
  @Input() vitals: any[] = [];
  
  public chartType: ChartType = 'bar';
  public chartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };
  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#374151', // Tailwind gray-700
          font: { family: 'inherit', size: 14, weight: 'bold' }
        }
      },
    },
    scales: {
      x: { ticks: { color: '#6b7280', font: { family: 'inherit', size: 12 } } },
      y: { ticks: { color: '#6b7280', font: { family: 'inherit', size: 12 } } }
    }
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['vitals'] && this.vitals) {
      this.chartData = {
        labels: this.vitals.map(v => new Date(v.created_at).toLocaleDateString()),
        datasets: [
          {
            label: 'Systolic',
            data: this.vitals.map(v => v.systolic),
            backgroundColor: '#2563eb',
            borderColor: '#2563eb',
            borderWidth: 2,
            borderRadius: 6
          },
          {
            label: 'Diastolic',
            data: this.vitals.map(v => v.diastolic),
            backgroundColor: '#10b981',
            borderColor: '#10b981',
            borderWidth: 2,
            borderRadius: 6
          }
        ]
      };
    }
  }

  getAverage(field: 'systolic' | 'diastolic'): number {
    if (!this.vitals.length) return 0;
    const sum = this.vitals.reduce((acc, v) => acc + (v[field] || 0), 0);
    return Math.round(sum / this.vitals.length);
  }
} 