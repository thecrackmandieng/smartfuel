import { Component } from '@angular/core';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Carte {
  codeCarte: string;
  prenom: string;
  nom: string;
  role: string;
  status: string;
  solde: number;
  selected?: boolean;
}

@Component({
  selector: 'app-gestion-cartes',
  standalone: true,
  imports: [SidebarComponent, CommonModule, FormsModule],
  templateUrl: './gestion-cartes.component.html',
  styleUrls: ['./gestion-cartes.component.css']
})
export class GestionCartesComponent {
user: any;
confirmDeleteCard() {
throw new Error('Method not implemented.');
}
  searchTerm: string = '';
  allSelected: boolean = false;
  hasSelection: boolean = false;
  filteredCartes: Carte[] = [
    { codeCarte: '123456', prenom: 'Ali', nom: 'Diop', role: 'utilisateur', status: 'Active', solde: 10000, selected: false },
    { codeCarte: '654321', prenom: 'Awa', nom: 'Ba', role: 'utilisateur', status: 'Inactive', solde: 5000, selected: false },
    { codeCarte: '654321', prenom: 'Awa', nom: 'Ba', role: 'utilisateur', status: 'Inactive', solde: 5000, selected: false },
    { codeCarte: '654321', prenom: 'Awa', nom: 'Ba', role: 'utilisateur', status: 'Inactive', solde: 5000, selected: false },
    { codeCarte: '654321', prenom: 'Awa', nom: 'Ba', role: 'utilisateur', status: 'Inactive', solde: 5000, selected: false },
    { codeCarte: '654321', prenom: 'Awa', nom: 'Ba', role: 'utilisateur', status: 'Inactive', solde: 5000, selected: false }




  ];
  cartes: Carte[] = [...this.filteredCartes];
  newCard: Carte = this.createEmptyCard();
  selectedCard: Carte | null = null;
  rechargeAmount: number = 0;

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredCartes = [...this.cartes];
      return;
    }
    const searchLower = this.searchTerm.toLowerCase();
    this.filteredCartes = this.cartes.filter(card => 
      card.codeCarte.toLowerCase().includes(searchLower) ||
      card.prenom.toLowerCase().includes(searchLower) ||
      card.nom.toLowerCase().includes(searchLower) ||
      card.role.toLowerCase().includes(searchLower)
    );
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
    this.cartes.unshift(this.newCard);
    this.filteredCartes = [...this.cartes];
    this.newCard = this.createEmptyCard();
    this.closeModal('addModal');
  }

  editCard(card: Carte) {
    console.log('Modification de la carte:', card);
    this.closeModal('editModal');
  }

  viewCard(card: Carte) {
    console.log('Affichage des détails de la carte:', card);
  }

  deleteCard(card: Carte) {
    const index = this.cartes.indexOf(card);
    if (index > -1) {
      this.cartes.splice(index, 1);
      this.filteredCartes = [...this.cartes];
    }
    this.closeModal('deleteModal');
  }

  deleteSelected() {
    this.cartes = this.cartes.filter(card => !card.selected);
    this.filteredCartes = [...this.cartes];
    this.checkSelection();
  }

  rechargeCard(card: Carte) {
    if (card) {
      card.solde += this.rechargeAmount;
      console.log('Recharge de la carte:', card, 'Montant:', this.rechargeAmount);
      this.closeModal('rechargeModal');
    }
  }

  toggleBlockCard(card: Carte) {
    card.status = card.status === 'Active' ? 'Inactive' : 'Active';
    console.log('Changement de statut de la carte:', card);
  }

  resetSearch() {
    this.searchTerm = '';
    this.filteredCartes = [...this.cartes];
  }

  openModal(modalId: string, card?: Carte) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'block';
    }
    if (card) {
      this.selectedCard = { ...card };
    }
  }

  closeModal(modalId: string) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
    }
    this.selectedCard = null;
  }

  private createEmptyCard(): Carte {
    return {
      codeCarte: '',
      prenom: '',
      nom: '',
      role: '',
      status: 'Inactive',
      solde: 0,
      selected: false
    };
  }
}