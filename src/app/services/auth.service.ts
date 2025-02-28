import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service'; // Import du service de cookies

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = 'http://localhost:5000/api/auth'; // Base de l'URL de l'API

  constructor(private http: HttpClient, private cookieService: CookieService) {}

  // Fonction pour obtenir l'URL de connexion
  private getLoginUrl(): string {
    return `${this.baseUrl}/login`;
  }

  // Fonction pour obtenir l'URL de déconnexion
  private getLogoutUrl(): string {
    return `${this.baseUrl}/logout`;
  }

  // Méthode pour l'authentification
authenticate(credentials: { codeSecret: string }): Observable<any> {
  return this.http.post<any>(this.getLoginUrl(), credentials, { withCredentials: true }).pipe(
    tap(response => {
      console.log('Réponse API complète:', response);
      if (response.role) {
        localStorage.setItem('userRole', response.role);
        console.log('Rôle de l\'utilisateur enregistré:', response.role);
      } else {
        console.error('Échec : Aucun rôle trouvé dans la réponse après connexion !');
      }
    }),
    catchError(error => {
      console.error('Erreur lors de l\'authentification :', error);
      return throwError(error); // Renvoie l'erreur pour être gérée ailleurs
    })
  );
}


  // Méthode pour récupérer le rôle de l'utilisateur
 getUserRole(): string | null {
    return localStorage.getItem('userRole'); // ✅ Récupère le rôle stocké
  }

  getUserId(): string {
    return localStorage.getItem('userId') || '';
  }
  

  // Méthode pour la déconnexion
  logout(): Observable<any> {
    return this.http.post<any>(this.getLogoutUrl(), {}).pipe(
      tap(() => {
        // Suppression du rôle du localStorage
        localStorage.removeItem('userRole');
        console.log('Déconnexion réussie. Rôle supprimé.');
        console.log('Cookies après déconnexion:', document.cookie);
      }),
      catchError((error) => {
        console.error('Erreur lors de la déconnexion :', error);
        return throwError(error); // Gérer l'erreur
      })
    );
  }

  // Méthode pour vérifier si l'utilisateur est authentifié
  isAuthenticated(): boolean {
    const userRole = this.getUserRole(); // Récupère le rôle via la méthode getUserRole
    const isAuth = userRole !== ''; // Vérifie si le rôle n'est pas vide
    console.log('Vérification de l\'authentification, rôle présent:', userRole);
    console.log('AuthGuard - Utilisateur authentifié:', isAuth);
    return this.getUserRole() !== null; // Renvoie true si le rôle est présent, sinon false
    return isAuth; // Renvoie true si le rôle est présent, sinon false
  }
}
