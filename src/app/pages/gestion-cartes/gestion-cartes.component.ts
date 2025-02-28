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
  isFrozen: boolean;
  isProcessing?: boolean;
  carburant?: string;
  litresAchetes?: number;
  montantDu?: number;
}

@Component({
  selector: 'app-gestion-cartes',
  standalone: true,
  imports: [SidebarComponent, CommonModule, FormsModule],
  templateUrl: './gestion-cartes.component.html',
  styleUrls: ['./gestion-cartes.component.css']
})
export class GestionCartesComponent implements OnInit {
  modalMessage: string = "";
  searchTerm: string = '';
  allSelected: boolean = false;
  hasSelection: boolean = false;
  filteredUtilisateurs: Utilisateur[] = [];
  utilisateurs: Utilisateur[] = [];
  newUser: Utilisateur = this.createEmptyUser();
  selectedUser: Utilisateur | null = null;
  assignCardCode: string = '';
  rechargeAmount: number = 0; // Ajout de la propriété pour le montant de recharge
  errors: { [key: string]: string } = {};
  currentPage: number = 1; // Ajout de la propriété pour la page actuelle
  itemsPerPage: number = 8; // Nombre d'éléments par page
  totalItems: number = 0; // Total d'éléments

  constructor(private crudService: CrudService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.getUsers();
  }

  validateForm(): boolean {
    this.errors = {};
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

  getUsers() {
    this.crudService.getUsers().subscribe(
      (data: Utilisateur[]) => {
        this.utilisateurs = data.filter(user => user.role === 'client'); // Filtrer les utilisateurs par rôle
        this.totalItems = this.utilisateurs.length; // Mettre à jour le total d'éléments
        this.filteredUtilisateurs = this.utilisateurs.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
      },
      (error) => {
        console.error("Erreur lors de la récupération des utilisateurs", error);
      }
    );
  }

  // Filtrer la liste en fonction de la recherche
  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredUtilisateurs = [...this.utilisateurs].slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
      return;
    }
    const searchLower = this.searchTerm.toLowerCase();
    this.filteredUtilisateurs = this.utilisateurs.filter(user =>
      user.matricule.toLowerCase().includes(searchLower) ||
      user.prenom.toLowerCase().includes(searchLower) ||
      user.nom.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)||
      (user.telephone && user.telephone.includes(this.searchTerm.trim())) // Recherche par numéro de téléphone
    ).slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
  }
  // Sélectionner/désélectionner toutes les cartes
  toggleAllSelection() {
    this.allSelected = !this.allSelected;
    this.filteredUtilisateurs.forEach(user => user.selected = this.allSelected);
    this.checkSelection();
  }
  // Vérifier si une carte est sélectionnée
  checkSelection() {
    this.hasSelection = this.filteredUtilisateurs.some(user => user.selected);
  }

  onRoleChange() {
    if (this.newUser.role === 'client') {
      this.newUser.carburant = '';
      this.newUser.montantDu = 0;
    } else {
      delete this.newUser.carburant;
      delete this.newUser.montantDu;
    }
  }

  addUser() {
    if (!this.validateForm()) {
      return;
    }

    this.newUser.nom = this.newUser.nom.trim();
    this.newUser.prenom = this.newUser.prenom.trim();
    this.newUser.email = this.newUser.email.trim().toLowerCase();
    this.newUser.telephone = this.newUser.telephone.trim();

    if (this.newUser.role === 'client') {
      if (!this.newUser.carburant) {
        this.errors['carburant'] = "Le champ 'carburant' est requis pour les clients.";
        return;
      }
      if (this.newUser.montantDu === undefined || this.newUser.montantDu < 0) {
        this.errors['montantDu'] = "Le champ 'montant dû' doit être positif pour les clients.";
        return;
      }
    }

    this.crudService.addUser(this.newUser).subscribe(
      (user: Utilisateur) => {
        this.utilisateurs.unshift(user);
        this.totalItems = this.utilisateurs.length; // Mettre à jour le total d'éléments
        this.filteredUtilisateurs = this.utilisateurs.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
        this.newUser = this.createEmptyUser();
        this.errors = {};
        this.closeModal('addModal');
        this.cdr.detectChanges();
      },
      (error: any) => {
        console.error("Erreur lors de l'ajout de l'utilisateur", error);
        this.errors['apiError'] = "Erreur lors de l'ajout de l'utilisateur. Veuillez réessayer.";
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
    const userId = user._id;

    if (user.status === 'actif') {
      this.crudService.addarchive(userId).subscribe(
        (response) => {
          console.log('Utilisateur archivé:', response);
          user.status = 'inactif';
          user.isFrozen = true;
          this.cdr.detectChanges();
        },
        (error) => {
          console.error("Erreur lors de l'archivage de l'utilisateur", error);
        }
      );
    } else {
      this.crudService.desarchive(userId).subscribe(
        (response) => {
          console.log('Utilisateur désarchivé:', response);
          user.status = 'actif';
          user.isFrozen = false;
          this.cdr.detectChanges();
        },
        (error) => {
          console.error("Erreur lors de la désarchivage de l'utilisateur", error);
        }
      );
    }
  }

  rechargeUser(user: Utilisateur) {
    // Réinitialiser les erreurs à chaque appel
    this.errors = {};
  
    if (!this.rechargeAmount || this.rechargeAmount <= 0) {
      console.error("Le montant à recharger doit être supérieur à zéro.");
      this.errors['rechargeAmount'] = "Le montant à recharger doit être supérieur à zéro.";
      return; // Sortir de la méthode si le montant n'est pas valide
    }
  
    this.crudService.rechargerCarte(user._id, this.rechargeAmount).subscribe(
      (response: any) => {
        console.log("Utilisateur rechargé avec succès :", response);
        user.montantDu = (user.montantDu || 0) + this.rechargeAmount; // Mettre à jour le montant
        this.closeModal('rechargeModal');
        this.showModal('successModal', "Recharge effectuée avec succès !");
      },
      (error: any) => {
        console.error("Erreur lors de la recharge de l'utilisateur", error);
        this.showModal('errorModal', "Erreur lors de la recharge de l'utilisateur !");
      }
    );
  }
  

  resetSearch() {
    this.searchTerm = '';
    this.filteredUtilisateurs = [...this.utilisateurs].slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
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

  // Méthode pour gérer les changements de champ et réinitialiser les erreurs correspondantes
clearError(field: string) {
  if (this.errors[field]) {
    delete this.errors[field]; // Supprime l'erreur pour le champ spécifique
  }
}

editUser(selectedUser: Utilisateur | null) {
  // Vérifier si un utilisateur a été sélectionné
  if (!selectedUser) {
    console.warn("Utilisateur sélectionné introuvable !");
    return;
  }

  // Réinitialiser les erreurs
  this.errors = {};

  // Valider les champs de l'utilisateur
  const isValid = this.validateFields(selectedUser);
  if (!isValid) {
    console.log("Des erreurs de validation sont présentes :", this.errors);
    // Les erreurs seront affichées dans le formulaire
    return; // Sortir de la méthode si des erreurs sont présentes
  }

  // Appel au service pour éditer l'utilisateur
  this.crudService.editUser(selectedUser._id, selectedUser).subscribe(
    (response: any) => {
      const index = this.utilisateurs.findIndex(u => u._id === response.item._id);
      if (index !== -1) {
        this.utilisateurs[index] = response.item;
        this.totalItems = this.utilisateurs.length; // Mettre à jour le total d'éléments
        this.filteredUtilisateurs = this.utilisateurs.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
        this.errors = {}; // Réinitialiser les erreurs après une édition réussie
        this.closeModal('editModal'); // Fermer le modal d'édition
        this.showModal('successModal', "Utilisateur modifié avec succès !"); // Afficher le message de succès
        this.cdr.detectChanges(); // Forcer la détection des changements
      }
    },
    (error: any) => {
      console.error("Erreur API :", error);
      this.showModal('errorModal', "Erreur lors de la modification de l'utilisateur !"); // Afficher le message d'erreur
    }
  );
}

  
  
  // Méthode de validation des champs
  validateFields(user: Utilisateur): boolean {
    let isValid = true;
  
    // Exemple de validation
    if (!user.nom || user.nom.trim() === "") {
      this.errors['nom'] = 'Le nom est requis.';
      isValid = false;
    }
    if (!user.prenom || user.prenom.trim() === "") {
      this.errors['prenom'] = 'Le prénom est requis.';
      isValid = false;
    }
    if (!user.email || !this.validateEmail(user.email)) {
      this.errors['email'] = 'L\'email est requis et doit être valide.';
      isValid = false;
    }
    if (user.telephone && !this.validatePhoneNumber(user.telephone)) {
      this.errors['telephone'] = 'Le numéro de téléphone doit être valide.';
      isValid = false;
    }
    // Ajoutez d'autres validations selon vos besoins
  
    return isValid;
  }
  
  
  // Exemple de validation d'email
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  // Exemple de validation de numéro de téléphone
  validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^[0-9]+$/; // Vous pouvez ajuster ce regex selon vos besoins
    return phoneRegex.test(phone);
  }
  

  deleteUser(user: Utilisateur) {
    if (!user || !user._id) {
      console.warn("Utilisateur invalide ou ID manquant !");
      return;
    }

    this.crudService.deleteUser(user._id).subscribe(
      (response) => {
        console.log("Utilisateur supprimé :", response);
        this.utilisateurs = this.utilisateurs.filter(u => u._id !== user._id);
        this.totalItems = this.utilisateurs.length; // Mettre à jour le total d'éléments
        this.filteredUtilisateurs = this.utilisateurs.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
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
      user.isProcessing = true;

      const action = user.status === 'actif' ? this.crudService.addarchive(userId) : this.crudService.desarchive(userId);

      action.subscribe(
        () => {
          user.status = user.status === 'actif' ? 'inactif' : 'actif';
          user.isProcessing = false;
        },
        (error) => {
          console.error(`Erreur lors de la mise à jour de l'utilisateur ${userId}`, error);
          user.isProcessing = false;
        }
      );
    });

    this.cdr.detectChanges();
  }

  deleteSelectedUsers() {
    const selectedUserIds = this.filteredUtilisateurs
      .filter(user => user.selected)
      .map(user => user._id);

    if (selectedUserIds.length === 0) {
      console.warn("Aucun utilisateur sélectionné !");
      return;
    }

    this.crudService.deleteMultipleUsers(selectedUserIds).subscribe(
      (response) => {
        console.log("Utilisateurs supprimés avec succès !", response);
        this.utilisateurs = this.utilisateurs.filter(u => !selectedUserIds.includes(u._id));
        this.totalItems = this.utilisateurs.length; // Mettre à jour le total d'éléments
        this.filteredUtilisateurs = this.utilisateurs.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
      },
      (error) => {
        console.error("Erreur lors de la suppression des utilisateurs", error);
      }
    );
  }

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

  isUserBlocked(user: Utilisateur): boolean {
    return user.status === 'inactif';
  }

  nextPage() {
    if ((this.currentPage * this.itemsPerPage) < this.totalItems) {
      this.currentPage++;
      this.filteredUtilisateurs = this.utilisateurs.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.filteredUtilisateurs = this.utilisateurs.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
    }
  }
}
