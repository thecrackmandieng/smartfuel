import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const userRole = this.authService.getUserRole(); // Récupérer le rôle de l'utilisateur
    console.log('Rôle de l\'utilisateur:', userRole);
    
    // Vérifiez si l'utilisateur a le rôle requis
    if (userRole === 'admin' || userRole === 'pompiste') { // Remplacez 'admin' par le rôle requis pour accéder à la route
      return true; // Autorise l'accès à la route
    } else {
      this.router.navigate(['/']); // Redirige vers la page de connexion ou une autre page
      return false; // Bloque l'accès à la route
    }
  }
}