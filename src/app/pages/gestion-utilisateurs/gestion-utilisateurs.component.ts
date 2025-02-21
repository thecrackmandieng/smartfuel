import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrudService } from '../../services/crud.service';
import { ChangeDetectorRef } from '@angular/core';


interface Utilisateur {
  _id: string;
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
export class GestionUtilisateursComponent implements OnInit {
  searchTerm: string = '';
  allSelected: boolean = false;
  hasSelection: boolean = false;
  filteredUtilisateurs: Utilisateur[] = [];
  utilisateurs: Utilisateur[] = [];
  newUser: Utilisateur = this.createEmptyUser();
  selectedUser: Utilisateur | null = null;
  assignCardCode: string = '';
    // Déclaration de la propriété errors
    errors: { [key: string]: string } = {};
  constructor(private crudService: CrudService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.getUsers();
  }

  validateForm(): boolean {
    this.errors = {}; // Réinitialiser les erreurs
    let valid = true;

    if (!this.newUser.prenom || !/^[A-Za-zÀ-ÿ -]+$/.test(this.newUser.prenom)) {
      this.errors['prenom'] = "Le prénom est invalide (lettres et espaces uniquement)";
      valid = false;
    }

    if (!this.newUser.nom || !/^[A-Za-zÀ-ÿ -]+$/.test(this.newUser.nom)) {
      this.errors['nom'] = "Le nom est invalide (lettres et espaces uniquement)";
      valid = false;
    }

    if (!this.newUser.email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(this.newUser.email)) {
      this.errors['email'] = "L'email est invalide";
      valid = false;
    }

    if (!this.newUser.telephone || !/^\d{8,15}$/.test(this.newUser.telephone)) {
      this.errors['telephone'] = "Le téléphone doit contenir entre 8 et 15 chiffres";
      valid = false;
    }

    if (!this.newUser.role) {
      this.errors['role'] = "Veuillez sélectionner un rôle";
      valid = false;
    }

    return valid;
  }

  // Récupérer la liste des utilisateurs depuis l'API
  getUsers() {
    this.crudService.getUsers().subscribe(
      (data: Utilisateur[]) => {
        this.utilisateurs = data;
        this.filteredUtilisateurs = [...this.utilisateurs];
      },
      (error) => {
        console.error("Erreur lors de la récupération des utilisateurs", error);
      }
    );
  }

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

  // Ajout d'un utilisateur via l'API
  addUser() {
    if (!this.validateForm()) {
      return; // Stopper l'exécution si le formulaire est invalide
    }

    this.crudService.addUser(this.newUser).subscribe(
      (user: Utilisateur) => {
        this.utilisateurs.unshift(user);
        this.filteredUtilisateurs = [...this.utilisateurs];
        this.newUser = this.createEmptyUser();
        this.errors = {}; // Réinitialiser les erreurs après un succès
        this.closeModal('addModal');
        this.cdr.detectChanges(); // Forcer la détection des changements
      },
      (error: any) => {
        console.error("Erreur lors de l'ajout de l'utilisateur", error);
      }
    );
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

  confirmDeleteUser() {
    if (this.selectedUser) {
      this.deleteUser(this.selectedUser);
      this.selectedUser = null;
    }
  }
  

  deleteSelected() {
    this.utilisateurs = this.utilisateurs.filter(user => !user.selected);
    this.filteredUtilisateurs = [...this.utilisateurs];
    this.checkSelection();
  }


  toggleBlockUser(user: Utilisateur) {
    const userId = user._id; // Assurez-vous que vous récupérez l'ID correct

    if (user.status === 'actif') {
        // Appel de la méthode pour archiver l'utilisateur
        this.crudService.addarchive(userId).subscribe(
            (response) => {
                console.log('Utilisateur archivé:', response);
                user.status = 'inactif'; // Mettez à jour le statut ici
                user.isFrozen = true; // Gel des champs après archivage
                this.cdr.detectChanges(); // Forcer la détection des changements
            },
            (error) => {
                console.error("Erreur lors de l'archivage de l'utilisateur", error);
            }
        );
    } else {
        // Appel de la méthode pour désarchiver l'utilisateur
        this.crudService.desarchive(userId).subscribe(
            (response) => {
                console.log('Utilisateur désarchivé:', response);
                user.status = 'actif'; // Mettez à jour le statut ici
                user.isFrozen = false; // Dégel des champs après désarchivage
                this.cdr.detectChanges(); // Forcer la détection des changements
            },
            (error) => {
                console.error("Erreur lors de la désarchivage de l'utilisateur", error);
            }
        );
    }
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
        // Créez une copie des valeurs de l'utilisateur sélectionné
        this.selectedUser = { ...user };
    }
}


editUser(selectedUser: Utilisateur) {
  if (!this.selectedUser) {
      return; // Arrête l'exécution si l'utilisateur sélectionné est nul ou si le formulaire est invalide
  }

  this.crudService.editUser(this.selectedUser._id, this.selectedUser).subscribe(
      (user: Utilisateur) => {
          const index = this.utilisateurs.findIndex(u => u._id === user._id);
          if (index !== -1) {
              this.utilisateurs[index] = user; // Mettre à jour l'utilisateur dans la liste
              this.filteredUtilisateurs = [...this.utilisateurs];
              this.errors = {}; // Réinitialiser les erreurs après un succès
              this.closeModal('editModal');
              this.cdr.detectChanges(); // Forcer la détection des changements
          }
      },
      (error: any) => {
          console.error("Erreur lors de la modification de l'utilisateur", error);
      }
  );
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
      _id: '',
      matricule: '',
      prenom: '',
      nom: '',
      email: '',
      telephone: '',
      role: '',
      status: 'Inactif',
      selected: false,
      isFrozen: false
    };
  }
}
