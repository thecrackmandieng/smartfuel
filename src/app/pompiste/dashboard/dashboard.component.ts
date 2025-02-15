import { Component } from '@angular/core';
import { SidebarComponent } from "../../sidebar/sidebar.component";

@Component({
  selector: 'app-pompiste-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [SidebarComponent]
})
export class PompisteDashboardComponent {}
