import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PumpService {
  private apiUrl = 'http://localhost:5000/api/pompes/ventes-pompes'; // Vérifiez que l'API est bien accessible

  constructor(private http: HttpClient) {}

  getPumpData(): Observable<any> {
    const token = localStorage.getItem('token'); // Récupération du token stocké
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<any>(this.apiUrl, { headers }).pipe(
      catchError(error => {
        console.error('❌ Erreur lors de la récupération des données de la pompe :', error);
        return throwError(() => new Error('Erreur lors de la récupération des données.'));
      })
    );
  }
}
