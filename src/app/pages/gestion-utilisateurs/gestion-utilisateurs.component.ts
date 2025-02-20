import { Component } from '@angular/core';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Utilisateur {
status: any;
role: any;
  matricule: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  selected?: boolean;
}

@Component({
  selector: 'app-gestion-utilisateurs',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './gestion-utilisateurs.component.html',
  styleUrls: ['./gestion-utilisateurs.component.css']
})
export class GestionUtilisateursComponent {
  utilisateurs: Utilisateur[] = [
    {
      matricule: '001', nom: 'Dieng', prenom: 'Moustapha', telephone: '771234567', role: 'utilisateur', status: 'Actif', email: 'moustapha@example.com', selected: false
    },
    {
      matricule: '001', nom: 'Dieng', prenom: 'Moustapha', telephone: '771234567', role: 'utilisateur', status: 'Inactif', email: 'moustapha@example.com', selected: false
    },
    {
      matricule: '001', nom: 'Dieng', prenom: 'Moustapha', telephone: '771234567', role: 'utilisateur', status: 'Actif', email: 'moustapha@example.com', selected: false
    },
    {
      matricule: '001', nom: 'Dieng', prenom: 'Moustapha', telephone: '771234567', role: 'utilisateur', status: 'Inactif', email: 'moustapha@example.com', selected: false
    },
    {
      matricule: '001', nom: 'Dieng', prenom: 'Moustapha', telephone: '771234567', role: 'utilisateur', status: 'Inactif', email: 'moustapha@example.com', selected: false
    },
    {
      matricule: '001', nom: 'Dieng', prenom: 'Moustapha', telephone: '771234567', role: 'utilisateur', status: 'Actif', email: 'moustapha@example.com', selected: false
    },
    {
      matricule: '001', nom: 'Dieng', prenom: 'Moustapha', telephone: '771234567', role: 'utilisateur', status: 'Inactif', email: 'moustapha@example.com', selected: false
    },
    {
      matricule: '001', nom: 'Dieng', prenom: 'Moustapha', telephone: '771234567', role: 'utilisateur', status: 'Actif', email: 'moustapha@example.com', selected: false
    }
    
  ];

  filteredUtilisateurs: Utilisateur[] = [...this.utilisateurs];
  searchTerm: string = '';
  allSelected: boolean = false;

  get hasSelection(): boolean {
    return this.utilisateurs.some(u => u.selected);
  }

  toggleAllSelection(): void {
    this.allSelected = !this.allSelected;
    this.filteredUtilisateurs.forEach(user => user.selected = this.allSelected);
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredUtilisateurs = [...this.utilisateurs];
      return;
    }
    const searchLower = this.searchTerm.toLowerCase();
    this.filteredUtilisateurs = this.utilisateurs.filter(user => 
      user.nom.toLowerCase().includes(searchLower) ||
      user.prenom.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.matricule.toLowerCase().includes(searchLower) ||
      user.telephone.includes(searchLower)
    );
  }

  deleteSelected(): void {
    this.utilisateurs = this.utilisateurs.filter(user => !user.selected);
    this.filteredUtilisateurs = [...this.utilisateurs];
    this.allSelected = false;
  }

  addUser(): void {
    const newUser: Utilisateur = {
      matricule: '00' + (this.utilisateurs.length + 1),
      nom: '',
      prenom: '',
      telephone: '',
      email: '',
      selected: false,
      status: undefined,
      role: undefined
    };
    this.utilisateurs.unshift(newUser);
    this.filteredUtilisateurs = [...this.utilisateurs];
  }

  editUser(user: Utilisateur): void {
    // Implémenter la logique d'édition
    console.log('Édition de l\'utilisateur:', user);
  }

  viewUser(user: Utilisateur): void {
    // Implémenter la logique de visualisation
    console.log('Visualisation de l\'utilisateur:', user);
  }

  deleteUser(user: Utilisateur): void {
    const index = this.utilisateurs.indexOf(user);
    if (index > -1) {
      this.utilisateurs.splice(index, 1);
      this.filteredUtilisateurs = [...this.utilisateurs];
    }
  }

  assignUser(user: Utilisateur): void {
    // Implémenter la logique d'assignation
    console.log('Assignation de l\'utilisateur:', user);
  }

  resetSearch(): void {
    this.searchTerm = '';
    this.filteredUtilisateurs = [...this.utilisateurs];
  }
}