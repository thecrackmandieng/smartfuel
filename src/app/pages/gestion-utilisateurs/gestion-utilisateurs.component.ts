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
  isProcessing?: boolean; // Ajout de cette propriété pour gérer l'état du bouton
  carburant?: string; // Ajouter cette ligne
  litresAchetes?: number; // Ajouter cette ligne
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
  modalMessage: string = ""; // Déclaration de la variable pour éviter l'erreur de compilation
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

    // Méthode pour gérer le changement de rôle
    onRoleChange() {
      // Logique à exécuter lorsque le rôle change
      if (this.newUser.role === 'client') {
        this.newUser.carburant = ''; // Réinitialiser ou ajouter la logique nécessaire
        this.newUser.litresAchetes = 0; // Réinitialiser ou ajouter la logique nécessaire
      } else {
        // Logique pour d'autres rôles
        delete this.newUser.carburant; // Si nécessaire, supprimer le carburant
        delete this.newUser.litresAchetes; // Si nécessaire, supprimer les litres achetés
      }
    }
    
  // Ajout d'un utilisateur via l'API
  addUser() {
    if (!this.validateForm()) {
      return; // Stopper l'exécution si le formulaire est invalide
    }
  
    // Ajouter le champ carburant si le rôle est 'client'
    if (this.newUser.role === 'client') {
      this.newUser.carburant = this.newUser.carburant || ''; // Assurez-vous qu'il a une valeur par défaut si non spécifié
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


  confirmDeleteUser() {
    if (this.selectedUser) {
      this.deleteUser(this.selectedUser);
      this.selectedUser = null;
    }
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


editUser(selectedUser: Utilisateur | null) {
  console.log("Bouton Modifier cliqué", selectedUser); // Vérifier si la fonction est appelée

  if (!selectedUser) {
      console.warn("Utilisateur sélectionné introuvable !");
      return;
  }

  this.crudService.editUser(selectedUser._id, selectedUser).subscribe(
    (response: any) => {
      console.log("Réponse API :", response); // Vérifier la réponse de l'API

      const index = this.utilisateurs.findIndex(u => u._id === response.item._id);
      if (index !== -1) {
        this.utilisateurs[index] = response.item;
        this.filteredUtilisateurs = [...this.utilisateurs];
        this.errors = {};
        this.closeModal('editModal'); // Fermer le modal d'édition
        this.showModal('successModal', "Utilisateur modifié avec succès !");
        this.cdr.detectChanges();
      }
    },
    (error: any) => {
      console.error("Erreur API :", error);
      this.showModal('errorModal', "Erreur lors de la modification de l'utilisateur !");
    }
  );
}

deleteUser(user: Utilisateur) {
  if (!user || !user._id) {
    console.warn("Utilisateur invalide ou ID manquant !");
    return;
  }

  this.crudService.deleteUser(user._id).subscribe(
    (response) => {
      console.log("Utilisateur supprimé :", response);

      // Supprimer l'utilisateur de la liste après confirmation de l'API
      this.utilisateurs = this.utilisateurs.filter(u => u._id !== user._id);
      this.filteredUtilisateurs = [...this.utilisateurs];

      this.closeModal('deleteModal');
      this.showModal('successModal', "Utilisateur supprimé avec succès !");
    },
    (error) => {
      console.error("Erreur lors de la suppression de l'utilisateur", error);
      this.showModal('errorModal', "Erreur lors de la suppression de l'utilisateur !");
    }
  );
}

blockMultipleUsers() {
  const selectedUsers = this.filteredUtilisateurs.filter(user => user.selected);

  if (selectedUsers.length === 0) {
    console.warn("Aucun utilisateur sélectionné !");
    return;
  }

  selectedUsers.forEach(user => {
    const userId = user._id;
    user.isProcessing = true; // Désactive temporairement le bouton

    // Détermine l'action (archivage ou désarchivage)
    const action = user.status === 'actif' ? this.crudService.addarchive(userId) : this.crudService.desarchive(userId);

    action.subscribe(
      () => {
        // Mise à jour de l'état après succès
        user.status = user.status === 'actif' ? 'inactif' : 'actif';
        user.isProcessing = false; // Réactive le bouton
      },
      (error) => {
        console.error(`Erreur lors de la mise à jour de l'utilisateur ${userId}`, error);
        user.isProcessing = false; // Réactive le bouton en cas d'échec
      }
    );
  });

  this.cdr.detectChanges(); // Forcer la mise à jour de l'affichage
}

deleteSelectedUsers() {
  const selectedUserIds = this.filteredUtilisateurs
    .filter(user => user.selected)  // Filtre les utilisateurs sélectionnés
    .map(user => user._id);         // Récupère les IDs des utilisateurs

  if (selectedUserIds.length === 0) {
    console.warn("Aucun utilisateur sélectionné !");
    return;
  }

  // Appel au service pour supprimer les utilisateurs sélectionnés
  this.crudService.deleteMultipleUsers(selectedUserIds).subscribe(
    (response) => {
      console.log("Utilisateurs supprimés avec succès !", response);
      
      // Mettre à jour l'affichage en filtrant les utilisateurs supprimés
      this.filteredUtilisateurs = this.filteredUtilisateurs.filter(user => !user.selected);
      
      // Optionnel : afficher un message de succès ou mettre à jour d'autres états
    },
    (error) => {
      console.error("Erreur lors de la suppression des utilisateurs", error);
      
      // Optionnel : afficher un message d'erreur à l'utilisateur
    }
  );
}




// Fonction pour afficher une modale avec un message
showModal(modalId: string, message: string) {
  this.modalMessage = message;
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'block';
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
