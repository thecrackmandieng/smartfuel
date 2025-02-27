import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = 'http://localhost:5000/api/auth';

  constructor(private http: HttpClient, private cookieService: CookieService) {}

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
        if (response.role) {
          localStorage.setItem('userRole', response.role);
        }
        if (response.userId) {
          localStorage.setItem('userId', response.userId);
        } else {
          console.error('Échec : Aucun ID utilisateur trouvé dans la réponse après connexion !');
        }
      }),
      catchError(error => {
        console.error('Erreur lors de l\'authentification :', error);
        return throwError(error);
      })
    );
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
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        console.log('Déconnexion réussie. Rôle et ID supprimés.');
      }),
      catchError((error) => {
        console.error('Erreur lors de la déconnexion :', error);
        return throwError(error);
      })
    );
  }

  isAuthenticated(): boolean {
    const userRole = this.getUserRole();
    return userRole !== '';
  }
}
