import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PumpService {
  private apiUrl = 'http://localhost:5000/api/pompes'; // Assurez-vous que l'URL est correcte

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // Récupération du token stocké
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getPumpData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ventes-pompes`, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('❌ Erreur lors de la récupération des données de la pompe :', error);
        return throwError(() => new Error('Erreur lors de la récupération des données.'));
      })
    );
  }

  getHistoricalPumpData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ventes-pompes/historical`, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('❌ Erreur lors de la récupération des données historiques de la pompe :', error);
        return throwError(() => new Error('Erreur lors de la récupération des données historiques.'));
      })
    );
  }

  getMonthlyPumpData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ventes-pompes/monthly`, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('❌ Erreur lors de la récupération des données mensuelles de la pompe :', error);
        return throwError(() => new Error('Erreur lors de la récupération des données mensuelles.'));
      })
    );
  }
}
