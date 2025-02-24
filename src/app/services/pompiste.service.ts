import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PompisteService {
  private baseUrl: string = 'http://localhost:5000/api/fuel'; // URL de base de l'API

  constructor(private http: HttpClient) { }

  // Méthode pour acheter du carburant
  acheterCarburant(userId: string, data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${userId}`, data);
  }
}