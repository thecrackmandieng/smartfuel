import { Component, AfterViewInit, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { Chart, registerables } from 'chart.js';
import { isPlatformBrowser } from '@angular/common';
import { FuelLevelService } from './../../services/fuel-level.service';
import { PumpService } from './../../services/pump.service';
import { Observable } from 'rxjs';

interface HistoricalData {
  diesel: number[];
  gazole: number[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class AdminDashboardComponent implements AfterViewInit {
  @ViewChild('salesChart') salesChartRef!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;
  isBrowser: boolean = false;
  essenceLevel: number = 0;
  gazoleLevel: number = 0;
  pumpData: any = {};
  historicalData: HistoricalData = { diesel: [], gazole: [] };
  showHistorical: boolean = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private fuelLevelService: FuelLevelService,
    private pumpService: PumpService
  ) {}

  ngOnInit() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.fetchFuelLevels();
    this.fetchPumpData();
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      Chart.register(...registerables);

      const canvas = this.salesChartRef.nativeElement;
      const context = canvas.getContext('2d');

      if (context) {
        this.chart = new Chart(context, {
          type: 'line',
          data: {
            labels: this.getWeekDays(),
            datasets: [{
              label: 'Ventes Diesel (litres)',
              data: [0, 0, 0, 0, 0, 0, 0],
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              fill: true,
              tension: 0.4,
              borderWidth: 2,
              pointBackgroundColor: '#10b981'
            }, {
              label: 'Ventes Gazoil (litres)',
              data: [0, 0, 0, 0, 0, 0, 0],
              borderColor: '#a16207',
              backgroundColor: 'rgba(161, 98, 7, 0.1)',
              fill: true,
              tension: 0.4,
              borderWidth: 2,
              pointBackgroundColor: '#a16207'
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  font: {
                    size: 12
                  }
                }
              }
            },
            scales: {
              x: {
                ticks: {
                  font: {
                    size: 10
                  },
                  color: '#333'
                }
              },
              y: {
                beginAtZero: true,
                ticks: {
                  font: {
                    size: 10
                  },
                  color: '#333'
                },
                grid: {
                  color: '#e0e0e0'
                }
              }
            }
          }
        });
      } else {
        console.error('Échec du contexte 2D.');
      }
    } else {
      console.error('Non exécuté dans un navigateur.');
    }
  }

  fetchFuelLevels() {
    this.fuelLevelService.getFuelLevels().subscribe((data) => {
      this.essenceLevel = data.essence;
      this.gazoleLevel = data.gazole;
      console.log('Niveaux de carburant mis à jour:', data);
    });
  }

  fetchPumpData() {
    this.pumpService.getPumpData().subscribe((data) => {
      console.log('Données des pompes reçues:', data);
      if (data) {
        this.pumpData = {
          dieselLiters: data.diesel?.liters || 0,
          dieselAmount: data.diesel?.amount || 0,
          gazoleLiters: data.gazoil?.liters || 0,
          gazoleAmount: data.gazoil?.amount || 0
        };

        if (this.chart && !this.showHistorical) {
          const dieselData = [0, 0, 0, 0, 0, 0, this.pumpData.dieselLiters];
          const gazoleData = [0, 0, 0, 0, 0, 0, this.pumpData.gazoleLiters];

          this.chart.data.datasets[0].data = dieselData;
          this.chart.data.datasets[1].data = gazoleData;
          this.chart.update();
        }
      } else {
        console.error('Structure des données incorrecte:', data);
      }
    }, (error: any) => {
      console.error('Erreur lors de la récupération des données des pompes:', error);
    });
  }

  fetchHistoricalData() {
    this.pumpService.getPumpData().subscribe((data: HistoricalData) => {
      this.historicalData = {
        diesel: data.diesel || [0, 0, 0, 0, 0, 0, 0],
        gazole: data.gazole || [0, 0, 0, 0, 0, 0, 0]
      };

      if (this.chart && this.showHistorical) {
        this.chart.data.datasets[0].data = this.historicalData.diesel;
        this.chart.data.datasets[1].data = this.historicalData.gazole;
        this.chart.update();
      }
    }, (error: any) => {
      console.error('Erreur lors de la récupération des données historiques:', error);
    });
  }

  toggleHistoricalData() {
    this.showHistorical = !this.showHistorical;
    if (this.showHistorical) {
      this.fetchHistoricalData();
    } else {
      const dieselData = [0, 0, 0, 0, 0, 0, this.pumpData.dieselLiters];
      const gazoleData = [0, 0, 0, 0, 0, 0, this.pumpData.gazoleLiters];

      this.chart.data.datasets[0].data = dieselData;
      this.chart.data.datasets[1].data = gazoleData;
      this.chart.update();
    }
  }

  getWeekDays(): string[] {
    const today = new Date();
    const weekdays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(today);
      day.setDate(today.getDate() - today.getDay() + i);
      weekdays.push(day.toLocaleDateString('fr-FR', { weekday: 'short' }));
    }
    return weekdays;
  }
}
