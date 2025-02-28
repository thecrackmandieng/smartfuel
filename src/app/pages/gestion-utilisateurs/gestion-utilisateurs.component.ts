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
  montantDu?: number; // ajouter cette ligne
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

  validateFields(user: any, fieldName?: string): boolean {
    // Réinitialise les erreurs pour le champ spécifié
    if (fieldName) {
        delete this.errors[fieldName];
    } else {
        this.errors = {}; // Réinitialise toutes les erreurs
    }

    // Validation des champs requis
    if (!user.prenom || user.prenom.trim() === '') {
        this.errors['prenom'] = 'Le prénom est requis.';
    }

    if (!user.nom || user.nom.trim() === '') {
        this.errors['nom'] = 'Le nom est requis.';
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!user.email || !emailPattern.test(user.email)) {
        this.errors['email'] = 'Veuillez entrer un email valide.';
    }

    if (!user.telephone || user.telephone.trim() === '') {
        this.errors['telephone'] = 'Le téléphone est requis.';
    }

    if (!user.role) {
        this.errors['role'] = 'Veuillez sélectionner un rôle.';
    }

    return Object.keys(this.errors).length === 0; // Retourne vrai si aucune erreur
}


// Méthode pour éditer l'utilisateur
editUser(selectedUser: Utilisateur | null) {
  console.log("Bouton Modifier cliqué", selectedUser); // Vérifier si la fonction est appelée

  if (!selectedUser) {
    console.warn("Utilisateur sélectionné introuvable !");
    return;
  }

  // Valider les champs avant de procéder à la modification
  this.errors = {}; // Réinitialise les erreurs
  const isValid = this.validateFields(selectedUser);
  
  if (!isValid) {
    console.log("Des erreurs de validation sont présentes :", this.errors);
    return; // Sortir de la méthode si des erreurs sont présentes
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

clearError(field: string): void {
  if (this.errors[field]) {
      delete this.errors[field];
  }
}


  // Récupérer la liste des utilisateurs depuis l'API
  getUsers() {
    this.crudService.getUsers().subscribe(
      (data: Utilisateur[]) => {
        console.log('Utilisateurs récupérés:', data); // Vérifiez les données récupérées
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
      user.email.toLowerCase().includes(searchLower) ||
      (user.telephone && user.telephone.includes(this.searchTerm.trim())) // Recherche par numéro de téléphone
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
  // Réinitialiser les erreurs
  this.errors = {};

  // Nettoyer les champs
  this.newUser.nom = this.newUser.nom.trim();
  this.newUser.prenom = this.newUser.prenom.trim();
  this.newUser.email = this.newUser.email.trim().toLowerCase();
  this.newUser.telephone = this.newUser.telephone.trim();

  // Validation des champs
  const isValid = this.validateFields(this.newUser);
  if (!isValid) {
    this.showErrors(); // Afficher les erreurs si le formulaire est invalide
    return; // Arrêter l'exécution si le formulaire est invalide
  }

  // Validation spécifique pour les clients
  if (this.newUser.role === 'client') {
    const clientErrors = this.validateClientFields();
    if (clientErrors.length > 0) {
      clientErrors.forEach(error => {
        this.errors[error.field] = error.message;
      });
      this.showErrors(); // Afficher les erreurs spécifiques aux clients
      return; // Arrêter l'exécution si des erreurs sont trouvées
    }
  }

  // Appel au service pour ajouter l'utilisateur
  this.crudService.addUser(this.newUser).subscribe(
    (user: Utilisateur) => {
      // Option 1: Mettre à jour la liste des utilisateurs
      this.utilisateurs.unshift(user);
      this.filteredUtilisateurs = [...this.utilisateurs]; // Mettre à jour la liste filtrée
      this.resetForm(); // Réinitialiser le formulaire ici
      this.closeModal('addModal'); // Fermer la modal

      // Option 2: Récupérer à nouveau tous les utilisateurs pour être sûr
      this.getUsers(); // Récupérer à nouveau la liste des utilisateurs
    },
    (error: any) => {
      console.error("Erreur lors de l'ajout de l'utilisateur", error);
      this.handleApiError(error);
    }
  );
}


// Nouvelle méthode pour afficher les erreurs
showErrors() {
  // Vérifiez les champs et réaffichez les erreurs si nécessaires
  if (!this.newUser.nom) {
    this.errors['nom'] = 'Le nom est requis.';
  }
  if (!this.newUser.prenom) {
    this.errors['prenom'] = 'Le prénom est requis.';
  }
  if (!this.newUser.email) {
    this.errors['email'] = 'L\'email est requis.';
  }
  if (!this.newUser.telephone) {
    this.errors['telephone'] = 'Le téléphone est requis.';
  }
  if (this.newUser.role === 'client') {
    // Ajoutez d'autres validations spécifiques ici
    if (!this.newUser.carburant) {
      this.errors['carburant'] = 'Le carburant est requis pour les clients.';
    }
    if (this.newUser.montantDu === undefined || this.newUser.montantDu === null || this.newUser.montantDu < 0) {
      this.errors['montantDu'] = 'Le montant dû doit être positif.';
    }
  }
}




// Validation des champs spécifiques aux clients
private validateClientFields() {
  const errors = [];

  if (!this.newUser.carburant) {
    errors.push({ field: 'carburant', message: "Le champ 'carburant' est requis pour les clients." });
  }
  
  if (this.newUser.montantDu === undefined || this.newUser.montantDu < 0) {
    errors.push({ field: 'montantDu', message: "Le champ 'montant dû' doit être positif pour les clients." });
  }

  return errors;
}

// Gestion des erreurs de l'API
private handleApiError(error: any) {
  if (error.error && error.error.msg) {
    this.errors['apiError'] = error.error.msg;
  } else {
    this.errors['apiError'] = "Erreur lors de l'ajout de l'utilisateur. Veuillez réessayer.";
  }
}

// Réinitialisation du formulaire
private resetForm() {
  this.newUser = this.createEmptyUser(); // Réinitialiser les champs
  this.errors = {}; // Réinitialiser les erreurs
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
