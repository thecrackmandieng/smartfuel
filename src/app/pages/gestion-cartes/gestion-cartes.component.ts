import { Component } from '@angular/core';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gestion-cartes',
  standalone: true,
  imports: [SidebarComponent,
    CommonModule,
    FormsModule],
  templateUrl: './gestion-cartes.component.html',
  styleUrl: './gestion-cartes.component.css'
})
export class GestionCartesComponent {
  searchTerm: string = '';
  allSelected: boolean = false;
  hasSelection: boolean = false;
  filteredCartes: any[] = [
    { codeCarte: '123456', prenom: 'Ali', nom: 'Diop', role: 'utilisateur', status: 'Active', selected: false },
    { codeCarte: '654321', prenom: 'Awa', nom: 'Ba', role: 'utilisateur', status: 'Inactive', selected: false }
  ];

  onSearch() {
    console.log('Recherche en cours:', this.searchTerm);
  }

  toggleAllSelection() {
    this.allSelected = !this.allSelected;
    this.filteredCartes.forEach(card => card.selected = this.allSelected);
    this.checkSelection();
  }

  checkSelection() {
    this.hasSelection = this.filteredCartes.some(card => card.selected);
  }

  addCard() {
    console.log('Ajout d\'une nouvelle carte');
  }

  editCard(card: any) {
    console.log('Modification de la carte:', card);
  }

  viewCard(card: any) {
    console.log('Affichage des détails de la carte:', card);
  }

  deleteCard(card: any) {
    console.log('Suppression de la carte:', card);
  }

  deleteSelected() {
    this.filteredCartes = this.filteredCartes.filter(card => !card.selected);
    this.checkSelection();
  }

  rechargeCard(card: any) {
    console.log('Recharge de la carte:', card);
  }
}