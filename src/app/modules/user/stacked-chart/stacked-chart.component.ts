import { Component, OnInit, Input } from '@angular/core';

import { ChartService } from '../../../core/services/chart.service';

@Component({
  selector: 'app-stacked-chart',
  templateUrl: './stacked-chart.component.html',
  styleUrls: ['./stacked-chart.component.scss']
})
export class StackedChartComponent implements OnInit {

  @Input() dataset: any;

  public chartType = 'bar';
  public chartDatasets: Array<any> = [];
  public chartLabels: Array<any> = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  public chartColors: Array<any> = [
    {
      backgroundColor: 'rgba(124, 181, 236, 0.8)',
      borderColor: 'rgba(124, 181, 236,1)',
      borderWidth: 2,
    },
    {
      backgroundColor: 'rgba(67, 67, 72, 0.8)',
      borderColor: 'rgba(67, 67, 72, 1)',
      borderWidth: 2,
    },
    {
      backgroundColor: 'rgba(144, 237, 125, 0.8)',
      borderColor: 'rgba(144, 237, 125, 1)',
      borderWidth: 2,
    },
    {
      backgroundColor: 'rgba(247, 163, 92, 0.8)',
      borderColor: 'rgba(247, 163, 92, 1)',
      borderWidth: 2,
    },
  ];
  public chartOptions: any = {
    responsive: true,
      scales: {
        xAxes: [{
          stacked: true
          }],
        yAxes: [
        {
          stacked: true
        }
      ]
    },
    maintainAspectRatio: false,
    tooltips: {
      callbacks: {
        label: function(tooltipItem, data) {
          var label = data.datasets[tooltipItem.datasetIndex].label || '';
          if (label) {
              label += ': ';
          }
          label += '$' + Math.round(tooltipItem.yLabel * 100) / 100;
          return label;
        }
      }
    }
  };
  public chartClicked(e: any): void { }
  public chartHovered(e: any): void { }

  constructor() { }

  ngOnInit() {
    this.chartDatasets = this.convertChartData(this.dataset);
  }

  convertChartData(data) {
    const chartData = [];
    for (let i = 0; i < data.length; ++i) {
      const item = {
        label: data[i].charityname,
        data: this.getDataset(data[i].invoices)
      };
      chartData.push(item);
    }
    return chartData;
  }

  getDataset(data) {
    const dataset = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < data.length; ++i) {
      const date = new Date(data[i].status_transitions.paid_at * 1000);
      const month = date.getMonth();
      dataset[month] += data[i].amount_paid / 100;
    }
    return dataset;
  }

}
