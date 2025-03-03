import { Component, OnInit, OnDestroy } from '@angular/core';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrudService } from '../../services/crud.service';
import { ChangeDetectorRef } from '@angular/core';
import { AssignService } from '../../services/assign.service';
import { Subscription } from 'rxjs';

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

interface Errors {
  [key: string]: string;
}

@Component({
  selector: 'app-gestion-utilisateurs',
  standalone: true,
  imports: [SidebarComponent, CommonModule, FormsModule],
  templateUrl: './gestion-utilisateurs.component.html',
  styleUrls: ['./gestion-utilisateurs.component.css']
})
export class GestionUtilisateursComponent implements OnInit, OnDestroy {
  modalMessage: string = "";
  searchTerm: string = '';
  allSelected: boolean = false;
  hasSelection: boolean = false;
  filteredUtilisateurs: Utilisateur[] = [];
  utilisateurs: Utilisateur[] = [];
  newUser: Utilisateur = this.createEmptyUser();
  selectedUser: Utilisateur | null = null;
  assignCardCode: string = '';
  errors: Errors = {};

  private errorSubscription!: Subscription;
  private userSubscription!: Subscription;

  constructor(
    private crudService: CrudService,
    private cdr: ChangeDetectorRef,
    private assignService: AssignService
  ) {}

  ngOnInit() {
    this.getUsers();
    this.subscribeToWebSocket();
  }

  ngOnDestroy() {
    this.errorSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }

  private subscribeToWebSocket() {
    this.errorSubscription = this.assignService.listenForErrors().subscribe(error => {
      console.error('Erreur WebSocket:', error);
      this.showModal('errorModal', error);
    });
  
    this.userSubscription = this.assignService.listenForScan().subscribe(data => {
      if (data) {
        console.log('Données reçues via WebSocket:', data);  // Affiche les données reçues
        // Assure-toi que `data` contient bien un `uid` avant de tenter de le parser
        if (data && data.uid) {
          this.assignCardCode = data.uid;  // Affecte directement la valeur de `uid` si elle existe
        } else {
          console.warn('UID absent des données reçues:', data);
        }
      }
    });
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

  validateFields(user: any, fieldName?: string): boolean {
    if (fieldName) {
        delete this.errors[fieldName];
    } else {
        this.errors = {};
    }

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

    return Object.keys(this.errors).length === 0;
  }

  editUser(selectedUser: Utilisateur | null) {
    if (!selectedUser) {
      console.warn("Utilisateur sélectionné introuvable !");
      return;
    }

    this.errors = {};
    const isValid = this.validateFields(selectedUser);

    if (!isValid) {
      console.log("Des erreurs de validation sont présentes :", this.errors);
      return;
    }

    this.crudService.editUser(selectedUser._id, selectedUser).subscribe(
      (response: any) => {
        console.log("Réponse API :", response);

        const index = this.utilisateurs.findIndex(u => u._id === response.item._id);
        if (index !== -1) {
          this.utilisateurs[index] = response.item;
          this.filteredUtilisateurs = [...this.utilisateurs];
          this.errors = {};
          this.closeModal('editModal');
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

  getUsers() {
    this.crudService.getUsers().subscribe(
      (data: Utilisateur[]) => {
        console.log('Utilisateurs récupérés:', data);
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
      (user.telephone && user.telephone.includes(this.searchTerm.trim()))
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

  onRoleChange() {
    if (this.newUser.role === 'client') {
      this.newUser.carburant = '';
      this.newUser.litresAchetes = 0;
    } else {
      delete this.newUser.carburant;
      delete this.newUser.litresAchetes;
    }
  }

  addUser() {
    this.errors = {};

    this.newUser.nom = this.newUser.nom.trim();
    this.newUser.prenom = this.newUser.prenom.trim();
    this.newUser.email = this.newUser.email.trim().toLowerCase();
    this.newUser.telephone = this.newUser.telephone.trim();

    const isValid = this.validateFields(this.newUser);
    if (!isValid) {
      this.showErrors();
      return;
    }

    if (this.newUser.role === 'client') {
      const clientErrors = this.validateClientFields();
      if (clientErrors.length > 0) {
        clientErrors.forEach(error => {
          this.errors[error.field] = error.message;
        });
        this.showErrors();
        return;
      }
    }

    this.crudService.addUser(this.newUser).subscribe(
      (user: Utilisateur) => {
        this.utilisateurs.unshift(user);
        this.filteredUtilisateurs = [...this.utilisateurs];
        this.resetForm();
        this.closeModal('addModal');
        this.getUsers();
      },
      (error: any) => {
        console.error("Erreur lors de l'ajout de l'utilisateur", error);
        this.handleApiError(error);
      }
    );
  }

  showErrors() {
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
      if (!this.newUser.carburant) {
        this.errors['carburant'] = 'Le carburant est requis pour les clients.';
      }
      if (this.newUser.montantDu === undefined || this.newUser.montantDu === null || this.newUser.montantDu < 0) {
        this.errors['montantDu'] = 'Le montant dû doit être positif.';
      }
    }
  }

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

  private handleApiError(error: any) {
    if (error.error && error.error.msg) {
      this.errors['apiError'] = error.error.msg;
    } else {
      this.errors['apiError'] = "Erreur lors de l'ajout de l'utilisateur. Veuillez réessayer.";
    }
  }

  private resetForm() {
    this.newUser = this.createEmptyUser();
    this.errors = {};
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

  deleteUser(user: Utilisateur) {
    if (!user || !user._id) {
      console.warn("Utilisateur invalide ou ID manquant !");
      return;
    }

    this.crudService.deleteUser(user._id).subscribe(
      (response) => {
        console.log("Utilisateur supprimé :", response);
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
        this.filteredUtilisateurs = this.filteredUtilisateurs.filter(user => !user.selected);
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
    this.assignCardCode = ''; // Réinitialiser le code de la carte
  }

  assignCardToUser() {
    if (this.selectedUser && this.assignCardCode) {
      const message = {
        userId: this.selectedUser._id, // Inclure le userId dans le message
        uid: this.assignCardCode
      };

      // Envoyer le message au serveur WebSocket
      this.assignService.sendMessage(message);

      // Fermer le modal après assignation
      this.closeModal('assignModal');
    } else {
      console.warn("Aucun utilisateur sélectionné ou code de carte manquant !");
    }
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
