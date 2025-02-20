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
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './gestion-pompes.component.html',
  styleUrls: ['./gestion-pompes.component.css']
})
export class GestionPompesComponent {
  pompes: Pompe[] = [
    { type: 'Diesel', prix: 1000, status: 'Active', selected: false },
    { type: 'Essence', prix: 1200, status: 'Inactive', selected: false },
    { type: 'GPL', prix: 800, status: 'Active', selected: false }
  ];

  filteredPompes: Pompe[] = [...this.pompes];
  searchTerm: string = '';
  allSelected: boolean = false;
  newPump: Pompe = { type: '', prix: 0, status: 'Active' };
  selectedPump: Pompe | null = null;
  pumpToDelete: Pompe | null = null;

  get hasSelection(): boolean {
    return this.pompes.some(p => p.selected);
  }

  toggleAllSelection(): void {
    this.allSelected = !this.allSelected;
    this.filteredPompes.forEach(pump => pump.selected = this.allSelected);
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredPompes = [...this.pompes];
      return;
    }
    const searchLower = this.searchTerm.toLowerCase();
    this.filteredPompes = this.pompes.filter(pump => 
      pump.type.toLowerCase().includes(searchLower)
    );
  }

  deleteSelected(): void {
    this.pompes = this.pompes.filter(pump => !pump.selected);
    this.filteredPompes = [...this.pompes];
    this.allSelected = false;
  }

  addPump(): void {
    this.pompes.push({ ...this.newPump });
    this.filteredPompes = [...this.pompes];
    this.newPump = { type: '', prix: 0, status: 'Active' };
    this.closeModal('addModal');
  }

  editPump(pump: Pompe | null): void {
    if (pump) {
      const index = this.pompes.findIndex(p => p.type === pump.type);
      if (index > -1) {
        this.pompes[index] = { ...pump };
        this.filteredPompes = [...this.pompes];
      }
      this.closeModal('editModal');
    }
  }

  deletePump(pump: Pompe): void {
    this.pumpToDelete = pump;
    this.openModal('deleteModal');
  }

  confirmDeletePump(): void {
    if (this.pumpToDelete) {
      this.pompes = this.pompes.filter(p => p !== this.pumpToDelete);
      this.filteredPompes = [...this.pompes];
      this.pumpToDelete = null;
      this.closeModal('deleteModal');
    }
  }

  openModal(modalId: string, pump?: Pompe): void {
    if (pump) {
      this.selectedPump = { ...pump };
    }
    document.getElementById(modalId)?.classList.add('show');
  }

  closeModal(modalId: string): void {
    document.getElementById(modalId)?.classList.remove('show');
    this.selectedPump = null;
  }

  checkSelection(): void {
    this.allSelected = this.filteredPompes.every(pump => pump.selected);
  }
}