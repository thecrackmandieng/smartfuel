// sidebar.component.ts (Angular TypeScript)
import { Component } from '@angular/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [FontAwesomeModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  constructor(
    library: FaIconLibrary,
    private authService: AuthService, // Injection du service AuthService
    private router: Router // Injection du service Router pour la redirection
  ) {
    library.addIconPacks(fas);
  }

  // Méthode de déconnexion
  onLogout() {
    this.authService.logout().subscribe(
      response => {
        console.log('Déconnexion réussie', response);
        // Redirection vers la page de connexion après déconnexion
        this.router.navigate(['/']);
      },
      error => {
        console.error('Erreur lors de la déconnexion', error);
      }
    );
  }
  
}