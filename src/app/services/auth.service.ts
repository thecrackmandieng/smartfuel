import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth/login'; // Remplacez par l'URL de votre API

  constructor(private http: HttpClient) {}

  // La méthode 'authenticate' attend désormais une chaîne de caractères
  authenticate(credentials: { codeSecret: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, credentials);
  }
  
}