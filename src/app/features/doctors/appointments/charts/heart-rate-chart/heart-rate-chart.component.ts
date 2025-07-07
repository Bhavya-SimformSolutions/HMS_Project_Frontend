 import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-heart-rate-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './heart-rate-chart.component.html',
  styleUrls: ['./heart-rate-chart.component.css']
})
export class HeartRateChartComponent implements OnChanges {
  @Input() vitals: any[] = [];

  public chartType: ChartType = 'line';
  public chartData: ChartData<'line'> = {
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
            label: 'Heart Rate',
            data: this.vitals.map(v => parseInt(v.heart_rate, 10)),
            backgroundColor: '#f59e42',
            borderColor: '#f59e42',
            borderWidth: 2,
            fill: false,
            tension: 0.1,
            pointRadius: 4,
            pointBackgroundColor: '#f59e42',
            pointBorderColor: '#f59e42'
          }
        ]
      };
    }
  }

  getAverage(field: 'heart_rate'): number {
    if (!this.vitals.length) return 0;
    const sum = this.vitals.reduce((acc, v) => acc + (parseInt(v[field], 10) || 0), 0);
    return Math.round(sum / this.vitals.length);
  }
} 