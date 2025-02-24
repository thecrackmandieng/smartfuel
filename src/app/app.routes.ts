import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin/dashboard/dashboard.component';
import { PompisteDashboardComponent } from './pompiste/dashboard/dashboard.component';
import { ClientDashboardComponent } from './client/dashboard/dashboard.component';
import { LoginComponent } from './auth/login/login.component';
import { AuthGuard } from './authguard/auth.guard';

// Importation des nouveaux composants
import { GestionUtilisateursComponent } from './pages/gestion-utilisateurs/gestion-utilisateurs.component';
import { GestionCartesComponent } from './pages/gestion-cartes/gestion-cartes.component';
import { GestionPompesComponent } from './pages/gestion-pompes/gestion-pompes.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard] },
  { path: 'admin/dashboaradmin', component: AdminDashboardComponent },
  { path: 'pompiste/dashboard', component: PompisteDashboardComponent, canActivate: [AuthGuard] },
  { path: 'client/dashboard', component: ClientDashboardComponent, canActivate: [AuthGuard] },

  // Routes ajoutées
  { path: 'admin/utilisateurs', component: GestionUtilisateursComponent, canActivate: [AuthGuard] },
  { path: 'admin/cartes', component: GestionCartesComponent, canActivate: [AuthGuard] },
  { path: 'admin/pompes', component: GestionPompesComponent, canActivate: [AuthGuard] }
];