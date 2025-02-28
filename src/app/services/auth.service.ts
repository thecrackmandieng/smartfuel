import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = 'http://localhost:5000/api/auth';

  constructor(private http: HttpClient) {}

  private getLoginUrl(): string {
    return `${this.baseUrl}/login`;
  }

  private getLogoutUrl(): string {
    return `${this.baseUrl}/logout`;
  }

  authenticate(credentials: { codeSecret: string }): Observable<any> {
    return this.http.post<any>(this.getLoginUrl(), credentials, { withCredentials: true }).pipe(
      tap(response => {
        console.log('Réponse API complète:', response);

        if (response.token) {
          localStorage.setItem('token', response.token);
          this.decodeAndStoreUserData(response.token);
        } else {
          console.error('Échec : Aucun token reçu après connexion !');
        }
      }),
      catchError(error => {
        console.error('Erreur lors de l\'authentification :', error);
        return throwError(error);
      })
    );
  }

  private decodeAndStoreUserData(token: string): void {
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1])); // Décoder le token JWT
      if (tokenPayload) {
        localStorage.setItem('userRole', tokenPayload.role);
        localStorage.setItem('userId', tokenPayload.id);
        console.log(`Utilisateur connecté : ID=${tokenPayload.id}, Rôle=${tokenPayload.role}`);
      } else {
        console.error('Erreur : Impossible d\'extraire les informations du token.');
      }
    } catch (error) {
      console.error('Erreur lors du décodage du token :', error);
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserRole(): string {
    return localStorage.getItem('userRole') || '';
  }

  getUserId(): string {
    return localStorage.getItem('userId') || '';
  }

  logout(): Observable<any> {
    return this.http.post<any>(this.getLogoutUrl(), {}).pipe(
      tap(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        console.log('Déconnexion réussie. Données utilisateur supprimées.');
      }),
      catchError((error) => {
        console.error('Erreur lors de la déconnexion :', error);
        return throwError(error);
      })
    );
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
