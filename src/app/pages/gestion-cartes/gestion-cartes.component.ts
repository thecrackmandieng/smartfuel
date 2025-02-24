import { Component } from '@angular/core';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService, Client } from '../../services/client.service';

@Component({
  selector: 'app-gestion-cartes',
  standalone: true,
  imports: [SidebarComponent, CommonModule, FormsModule],
  templateUrl: './gestion-cartes.component.html',
  styleUrls: ['./gestion-cartes.component.css']
})
export class GestionCartesComponent {
  // Propriété de recherche
  searchTerm: string = '';
  allSelected: boolean = false;
  hasSelection: boolean = false;

  // « filteredCartes » et « cartes » contiendront la liste des clients (cartes)
  filteredCartes: Client[] = [];
  cartes: Client[] = [];

  // Propriétés pour le formulaire d'ajout et de modification
  newCard: Client = this.createEmptyClient();
  selectedCard: Client | null = null;

  // Montant pour le rechargement
  rechargeAmount: number = 0;

  constructor(private clientService: ClientService) {
    if (!clientService) {
      console.error("Le service ClientService est undefined !");
    }
    // Chargement initial des clients
    this.loadClients();
  }
  // Récupération des clients via le service
  loadClients() {
    this.clientService.getClients().subscribe(
      (clients) => {
        this.cartes = clients;
        this.filteredCartes = [...clients];
      },
      (error) => {
        console.error("Erreur lors de la récupération des clients", error);
      }
    );
  }
  // Filtrer la liste en fonction de la recherche
  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredCartes = [...this.cartes];
      return;
    }
    const searchLower = this.searchTerm.toLowerCase();
    this.filteredCartes = this.cartes.filter(card =>
      (card.codeCarte || '').toLowerCase().includes(searchLower) ||
      card.prenom.toLowerCase().includes(searchLower) ||
      card.nom.toLowerCase().includes(searchLower) ||
      card.role.toLowerCase().includes(searchLower)
    );
  }
  // Sélectionner/désélectionner toutes les cartes
  toggleAllSelection() {
    this.allSelected = !this.allSelected;
    this.filteredCartes.forEach(card => card.selected = this.allSelected);
    this.checkSelection();
  }
  // Vérifier si une carte est sélectionnée
  checkSelection() {
    this.hasSelection = this.filteredCartes.some(card => card.selected);
  }
  // Ajout d'une nouvelle carte/client via le service
  addCard() {
    this.clientService.addClient(this.newCard).subscribe(
      (response) => {
        // On récupère le client ajouté depuis la réponse
        const addedClient = response.client;
        this.cartes.unshift(addedClient);
        this.filteredCartes = [...this.cartes];
        this.newCard = this.createEmptyClient();
        this.closeModal('addModal');
      },
      (error) => {
        console.error("Erreur lors de l'ajout du client", error);
      }
    );
  }
  // Modification d'un client
  editCard(card: Client) {
    if (card._id) {
      this.clientService.updateClient(card._id, card).subscribe(
        (response) => {
          console.log("Client modifié avec succès", response);
          this.loadClients();
          this.closeModal('editModal');
        },
        (error) => {
          console.error("Erreur lors de la modification du client", error);
        }
      );
    }
  }
  // Suppression d'une carte/client
  deleteCard(card: Client) {
    if (card._id) {
      this.clientService.deleteClient(card._id).subscribe(
        (response) => {
          this.cartes = this.cartes.filter(c => c._id !== card._id);
          this.filteredCartes = [...this.cartes];
          this.closeModal('deleteModal');
        },
        (error) => {
          console.error("Erreur lors de la suppression du client", error);
        }
      );
    }
  }
  // Suppression de toutes les cartes sélectionnées
  deleteSelected() {
    this.filteredCartes.filter(card => card.selected && card._id).forEach(card => {
      this.clientService.deleteClient(card._id as string).subscribe(
        (response) => {
          console.log("Client supprimé", response);
          this.loadClients();
        },
        (error) => {
          console.error("Erreur lors de la suppression d'un client", error);
        }
      );
    });
  }
  // Rechargement de la carte (mise à jour du solde)
  rechargeCard(card: Client) {
    if (card && card._id) {
      const updatedData = { solde: (card.solde || 0) + this.rechargeAmount };
      this.clientService.updateClient(card._id, updatedData).subscribe(
        (response) => {
          card.solde = (card.solde || 0) + this.rechargeAmount;
          this.closeModal('rechargeModal');
        },
        (error) => {
          console.error("Erreur lors du rechargement de la carte", error);
        }
      );
    }
  }
  // Blocage/Déblocage d'une carte
  toggleBlockCard(card: Client) {
    const newStatus = card.status === 'active' ? 'inactive' : 'active';
    if (card._id) {
      this.clientService.updateClient(card._id, { status: newStatus }).subscribe(
        (response) => {
          card.status = newStatus;
          console.log("Statut mis à jour", response);
        },
        (error) => {
          console.error("Erreur lors de la mise à jour du statut", error);
        }
      );
    }
  }
  // Réinitialisation de la recherche
  resetSearch() {
    this.searchTerm = '';
    this.filteredCartes = [...this.cartes];
  }
  // Gestion des modales
  openModal(modalId: string, card?: Client) {
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
  // Création d'un client vide pour le formulaire d'ajout
  private createEmptyClient(): Client {
    return {
      _id: '',
      codeCarte: '',
      prenom: '',
      nom: '',
      telephone: '',
      email: '',
      role: '',
      carburant: '',
      status: 'inactive',
      solde: 0,
      selected: false
    };
  }

  // Méthode pour la confirmation de suppression (si nécessaire)
  confirmDeleteCard() {
    if (this.selectedCard) {
      this.deleteCard(this.selectedCard);
    }
  }
}