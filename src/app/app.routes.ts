import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin/dashboard/dashboard.component';
import { PompisteDashboardComponent } from './pompiste/dashboard/dashboard.component';
import { ClientDashboardComponent } from './client/dashboard/dashboard.component';
import { LoginComponent } from './auth/login/login.component';

// Importation des nouveaux composants
import { GestionUtilisateursComponent } from './pages/gestion-utilisateurs/gestion-utilisateurs.component';
import { GestionCartesComponent } from './pages/gestion-cartes/gestion-cartes.component';
import { GestionPompesComponent } from './pages/gestion-pompes/gestion-pompes.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'admin/dashboard', component: AdminDashboardComponent },
  { path: 'pompiste/dashboard', component: PompisteDashboardComponent },
  { path: 'client/dashboard', component: ClientDashboardComponent },

  // Routes ajoutées
  { path: 'admin/utilisateurs', component: GestionUtilisateursComponent },
  { path: 'admin/cartes', component: GestionCartesComponent },
  { path: 'admin/pompes', component: GestionPompesComponent }
];