import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin/dashboard/dashboard.component';
import { PompisteDashboardComponent } from './pompiste/dashboard/dashboard.component';
import { ClientDashboardComponent } from './client/dashboard/dashboard.component';
import { LoginComponent } from './auth/login/login.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'admin/dashboard', component: AdminDashboardComponent },
  { path: 'pompiste/dashboard', component: PompisteDashboardComponent },
  { path: 'client/dashboard', component: ClientDashboardComponent },
];