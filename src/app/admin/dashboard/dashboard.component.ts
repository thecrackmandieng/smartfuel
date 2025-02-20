import { Component, AfterViewInit, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common'; // Assurez-vous que CommonModule est importé
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { Chart, registerables } from 'chart.js';
import { isPlatformBrowser } from '@angular/common';

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
  isBrowser: boolean = false;  // Flag pour vérifier si c'est dans un navigateur

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    // Vérifier si c'est un navigateur
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      // ✅ Enregistrer les modules Chart.js (version 3+)
      Chart.register(...registerables);

      const canvas = this.salesChartRef.nativeElement;
      const context = canvas.getContext('2d');

      if (context) {
        this.chart = new Chart(context, {
          type: 'line',
          data: {
            labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
            datasets: [{
              label: 'Ventes Diesel (%)',
              data: [30, 45, 55, 50, 65, 75, 85],
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              fill: true,
              tension: 0.4,
              borderWidth: 2,
              pointBackgroundColor: '#10b981'
            }, {
              label: 'Ventes Gazoil (%)',
              data: [20, 40, 60, 65, 55, 80, 70],
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
}