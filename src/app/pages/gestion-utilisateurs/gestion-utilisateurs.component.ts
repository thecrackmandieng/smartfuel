import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrudService } from '../../services/crud.service';
import { ChangeDetectorRef } from '@angular/core';


interface Utilisateur {
  matricule: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  role: string;
  status: string;
  selected?: boolean;
  isFrozen: boolean; // Indique si les champs sont gelés
}

interface Errors {
  [key: string]: string; // Permet d'accéder aux messages d'erreur par clé
}


@Component({
  selector: 'app-gestion-utilisateurs',
  standalone: true,
  imports: [SidebarComponent, CommonModule, FormsModule],
  templateUrl: './gestion-utilisateurs.component.html',
  styleUrls: ['./gestion-utilisateurs.component.css']
})
export class GestionUtilisateursComponent {
confirmDeleteUser() {
throw new Error('Method not implemented.');
}
  searchTerm: string = '';
  allSelected: boolean = false;
  hasSelection: boolean = false;
  filteredUtilisateurs: Utilisateur[] = [
    { matricule: '123456', prenom: 'Ali', nom: 'Diop', email: 'ali.diop@example.com', telephone: '123456789', role: 'Utilisateur', status: 'Actif', selected: false },
    { matricule: '654321', prenom: 'Awa', nom: 'Ba', email: 'awa.ba@example.com', telephone: '987654321', role: 'Pompiste', status: 'Inactif', selected: false },
    { matricule: '654321', prenom: 'Awa', nom: 'Ba', email: 'awa.ba@example.com', telephone: '987654321', role: 'Pompiste', status: 'Inactif', selected: false },
    { matricule: '654321', prenom: 'Awa', nom: 'Ba', email: 'awa.ba@example.com', telephone: '987654321', role: 'Pompiste', status: 'Inactif', selected: false },
    { matricule: '654321', prenom: 'Awa', nom: 'Ba', email: 'awa.ba@example.com', telephone: '987654321', role: 'Pompiste', status: 'Inactif', selected: false },
    { matricule: '654321', prenom: 'Awa', nom: 'Ba', email: 'awa.ba@example.com', telephone: '987654321', role: 'Pompiste', status: 'Inactif', selected: false }




  ];
  utilisateurs: Utilisateur[] = [...this.filteredUtilisateurs];
  newUser: Utilisateur = this.createEmptyUser();
  selectedUser: Utilisateur | null = null;
  assignCardCode: string = '';

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredUtilisateurs = [...this.utilisateurs];
      return;
    }
    const searchLower = this.searchTerm.toLowerCase();
    this.filteredUtilisateurs = this.utilisateurs.filter(user => 
      user.matricule.toLowerCase().includes(searchLower) ||
      user.prenom.toLowerCase().includes(searchLower) ||
      user.nom.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  }

  toggleAllSelection() {
    this.allSelected = !this.allSelected;
    this.filteredUtilisateurs.forEach(user => user.selected = this.allSelected);
    this.checkSelection();
  }

  checkSelection() {
    this.hasSelection = this.filteredUtilisateurs.some(user => user.selected);
  }

  addUser() {
    this.utilisateurs.unshift(this.newUser);
    this.filteredUtilisateurs = [...this.utilisateurs];
    this.newUser = this.createEmptyUser();
    this.closeModal('addModal');
  }

  editUser(user: Utilisateur) {
    console.log('Modification de l\'utilisateur:', user);
    this.closeModal('editModal');
  }

  viewUser(user: Utilisateur) {
    console.log('Affichage des détails de l\'utilisateur:', user);
  }

  deleteUser(user: Utilisateur) {
    const index = this.utilisateurs.indexOf(user);
    if (index > -1) {
      this.utilisateurs.splice(index, 1);
      this.filteredUtilisateurs = [...this.utilisateurs];
    }
    this.closeModal('deleteModal');
  }

  deleteSelected() {
    this.utilisateurs = this.utilisateurs.filter(user => !user.selected);
    this.filteredUtilisateurs = [...this.utilisateurs];
    this.checkSelection();
  }

  toggleBlockUser(user: Utilisateur) {
    user.status = user.status === 'Actif' ? 'Inactif' : 'Actif';
    console.log('Changement de statut de l\'utilisateur:', user);
  }

  assignCard(user: Utilisateur) {
    console.log('Assignation de la carte:', this.assignCardCode, 'à l\'utilisateur:', user);
    this.closeModal('assignModal');
  }

  resetSearch() {
    this.searchTerm = '';
    this.filteredUtilisateurs = [...this.utilisateurs];
  }

  openModal(modalId: string, user?: Utilisateur) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'block';
    }
    if (user) {
      this.selectedUser = { ...user };
    }
  }

  closeModal(modalId: string) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
    }
    this.selectedUser = null;
  }

  private createEmptyUser(): Utilisateur {
    return {
      matricule: '',
      prenom: '',
      nom: '',
      email: '',
      telephone: '',
      role: '',
      status: 'Inactif',
      selected: false
    };
  }
}