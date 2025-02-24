import { Component, OnInit } from '@angular/core';
import { PompeService, Pompe } from '../../services/pompe.service';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gestion-pompes',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './gestion-pompes.component.html',
  styleUrls: ['./gestion-pompes.component.css']
})
export class GestionPompesComponent implements OnInit {
  searchTerm: string = '';
  allSelected: boolean = false;
  hasSelection: boolean = false;
  pompes: Pompe[] = [];
  filteredPompes: Pompe[] = [];
  newPump: Pompe = this.createEmptyPump();
  selectedPump: Pompe | null = null;
  showSuccessModal: boolean = false;

  constructor(private pompeService: PompeService) {}

  ngOnInit(): void {
    this.loadPompes();
  }

  loadPompes() {
    this.pompeService.getPompes().subscribe({
      next: (data: Pompe[]) => {
        this.pompes = data;
        this.filteredPompes = data;
      },
      error: (err) => console.error('Erreur lors du chargement des pompes', err)
    });
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredPompes = [...this.pompes];
      return;
    }
    const searchLower = this.searchTerm.toLowerCase();
    this.filteredPompes = this.pompes.filter(pompe =>
      pompe.typeCarburant.toLowerCase().includes(searchLower)
    );
  }

  toggleAllSelection() {
    this.allSelected = !this.allSelected;
    this.filteredPompes.forEach(pompe => pompe.selected = this.allSelected);
    this.checkSelection();
  }

  checkSelection() {
    this.hasSelection = this.filteredPompes.some(pompe => pompe.selected);
  }

  addPump() {
    this.pompeService.addPompe(this.newPump).subscribe({
      next: (response) => {
        const createdPompe = response.pompe;
        this.pompes.unshift(createdPompe);
        this.filteredPompes = [...this.pompes];
        this.newPump = this.createEmptyPump();
        this.closeModal('addModal');
        this.showSuccess();
      },
      error: (err) => console.error('Erreur lors de l\'ajout de la pompe', err)
    });
  }

  editPump(pompe: Pompe) {
    this.pompeService.updatePompe(pompe).subscribe({
      next: () => {
        this.closeModal('editModal');
        this.loadPompes();
      },
      error: (err) => console.error('Erreur lors de la modification de la pompe', err)
    });
  }

  deletePump(pompe: Pompe | null) {
    if (pompe && pompe._id) {
      this.pompeService.deletePompe(pompe._id).subscribe({
        next: () => {
          this.pompes = this.pompes.filter(p => p._id !== pompe._id);
          this.filteredPompes = [...this.pompes];
          this.closeModal('deleteModal');
        },
        error: (err) => console.error('Erreur lors de la suppression de la pompe', err)
      });
    }
  }

  toggleBlockPump(pompe: Pompe) {
    pompe.status = pompe.status === 'Active' ? 'Inactive' : 'Active';
    this.pompeService.updatePompe(pompe).subscribe({
      next: () => console.log('Statut modifié', pompe),
      error: (err) => console.error('Erreur lors du changement de statut', err)
    });
  }

  openModal(modalId: string, pompe?: Pompe) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'block';
    }
    if (pompe) {
      this.selectedPump = { ...pompe };
    }
  }

  closeModal(modalId: string) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
    }
    this.selectedPump = null;
  }

  showSuccess() {
    this.showSuccessModal = true;
    setTimeout(() => this.showSuccessModal = false, 3000);
  }
  deleteSelected() {
    const selectedIds = this.pompes
       .filter(p => p.selected && p._id)
       .map(p => p._id!);
 
    if (selectedIds.length > 0) {
       this.pompeService.deletePompes(selectedIds).subscribe({
          next: () => {
             this.pompes = this.pompes.filter(p => !selectedIds.includes(p._id!));
             this.filteredPompes = [...this.pompes];
             this.checkSelection();
          },
          error: (err) => console.error('Erreur lors de la suppression multiple', err)
       });
    }
 }
 
 confirmDeletePump() {
    if (this.selectedPump) {
       this.deletePump(this.selectedPump);
    }
 }
 
  private createEmptyPump(): Pompe {
    return {
      type: '',
      prix: 0,
      status: 'Inactive',
      selected: false,
      typeCarburant: ''
    };
  }
}
