import { Component } from '@angular/core';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Pompe {
  type: string;
  prix: number;
  status: string;
  selected?: boolean;
}

@Component({
  selector: 'app-gestion-pompes',
  standalone: true,
  imports: [SidebarComponent, CommonModule, FormsModule],
  templateUrl: './gestion-pompes.component.html',
  styleUrls: ['./gestion-pompes.component.css']
})
export class GestionPompesComponent {
confirmDeletePump() {
throw new Error('Method not implemented.');
}
  searchTerm: string = '';
  allSelected: boolean = false;
  hasSelection: boolean = false;
  filteredPompes: Pompe[] = [
    { type: 'Diesel', prix: 1000, status: 'Active', selected: false },
    { type: 'Gazol', prix: 900, status: 'Inactive', selected: false }
  ];
  pompes: Pompe[] = [...this.filteredPompes];
  newPump: Pompe = this.createEmptyPump();
  selectedPump: Pompe | null = null;

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredPompes = [...this.pompes];
      return;
    }
    const searchLower = this.searchTerm.toLowerCase();
    this.filteredPompes = this.pompes.filter(pompe => 
      pompe.type.toLowerCase().includes(searchLower)
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
    this.pompes.unshift(this.newPump);
    this.filteredPompes = [...this.pompes];
    this.newPump = this.createEmptyPump();
    this.closeModal('addModal');
  }

  editPump(pompe: Pompe) {
    console.log('Modification de la pompe:', pompe);
    this.closeModal('editModal');
  }

  viewPump(pompe: Pompe) {
    console.log('Affichage des détails de la pompe:', pompe);
  }

  deletePump(pompe: Pompe) {
    const index = this.pompes.indexOf(pompe);
    if (index > -1) {
      this.pompes.splice(index, 1);
      this.filteredPompes = [...this.pompes];
    }
    this.closeModal('deleteModal');
  }

  deleteSelected() {
    this.pompes = this.pompes.filter(pompe => !pompe.selected);
    this.filteredPompes = [...this.pompes];
    this.checkSelection();
  }

  toggleBlockPump(pompe: Pompe) {
    pompe.status = pompe.status === 'Active' ? 'Inactive' : 'Active';
    console.log('Changement de statut de la pompe:', pompe);
  }

  resetSearch() {
    this.searchTerm = '';
    this.filteredPompes = [...this.pompes];
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

  private createEmptyPump(): Pompe {
    return {
      type: '',
      prix: 0,
      status: 'Inactive',
      selected: false
    };
  }
}