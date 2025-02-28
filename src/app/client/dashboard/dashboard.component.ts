import { Component, OnInit, Renderer2, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CrudService } from '../../services/crud.service';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule, HttpClientModule]
})
export class ClientDashboardComponent implements OnInit {
  private dieselPricePerLiter = 1000;
  private gazoilPricePerLiter = 900;
  private huilePricePerLiter = 1100;
  private autrePricePerLiter = 1200;
  private selectedFuelType: 'diesel' | 'gazoil' | 'huile' | 'autre' = 'diesel';
  public availableFuelTypes = ['diesel', 'gazoil', 'huile', 'autre'];
  public soldeCompte = 0; // Initialisé à 0, sera mis à jour après récupération
  public errorMessage: string = '';
  private decrementInterval: any;
  public isLoggedIn: boolean = false;

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    private authService: AuthService,
    private router: Router,
    private crudService: CrudService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    const userId = this.authService.getUserId();
    if (userId) {
      this.getUserBalance(userId);
    }

    const fuelBtn = this.el.nativeElement.querySelector('#fuel-btn') as HTMLElement;
    const selectElement = this.el.nativeElement.querySelector('#fuel-select') as HTMLSelectElement;
    const inputFields = this.el.nativeElement.querySelector('#input-fields') as HTMLElement;
    const amountInput = this.el.nativeElement.querySelector('#amount') as HTMLInputElement;
    const volumeInput = this.el.nativeElement.querySelector('#volume') as HTMLInputElement;
    const validateBtn = this.el.nativeElement.querySelector('#validate-btn') as HTMLElement;
    const cancelBtn = this.el.nativeElement.querySelector('#cancel-btn') as HTMLElement;

    if (fuelBtn && selectElement && inputFields && amountInput && volumeInput && validateBtn && cancelBtn) {
      this.updateFuelDisplay(fuelBtn, selectElement);

      this.renderer.setStyle(selectElement, 'background-color', 'green');
      this.renderer.setStyle(selectElement, 'color', 'white');
      this.renderer.setStyle(selectElement, 'border', 'none');
      this.renderer.setStyle(selectElement, 'padding', '10px');
      this.renderer.setStyle(selectElement, 'font-size', '16px');
      this.renderer.setStyle(selectElement, 'cursor', 'pointer');
      this.renderer.setStyle(selectElement, 'box-shadow', '0 4px 6px rgba(0, 0, 0, 0.1)');
      this.renderer.setStyle(selectElement, 'transition', 'box-shadow 0.3s ease');
      this.renderer.setStyle(selectElement, 'border-radius', '4px');

      this.renderer.listen(selectElement, 'mouseover', () => {
        this.renderer.setStyle(selectElement, 'box-shadow', '0 6px 8px rgba(0, 0, 0, 0.2)');
      });

      this.renderer.listen(selectElement, 'mouseout', () => {
        this.renderer.setStyle(selectElement, 'box-shadow', '0 4px 6px rgba(0, 0, 0, 0.1)');
      });

      this.renderer.listen(fuelBtn, 'click', () => {
        this.renderer.setStyle(inputFields, 'display', 'flex');
      });

      this.renderer.listen(selectElement, 'change', () => {
        this.toggleFuelSelection(selectElement);
      });

      this.renderer.listen(amountInput, 'input', (event: Event) => {
        const target = event.target as HTMLInputElement;
        const amount = parseFloat(target.value);
        const volume = this.calculateVolume(amount);

        if (amount > this.soldeCompte) {
          this.errorMessage = 'Le montant dépasse le solde de votre compte.';
        } else {
          this.errorMessage = '';
        }
      });

      this.renderer.listen(volumeInput, 'input', (event: Event) => {
        const target = event.target as HTMLInputElement;
        const volume = parseFloat(target.value);
        const amount = this.calculateAmount(volume);

        if (amountInput) {
          this.renderer.setProperty(amountInput, 'value', amount.toFixed(2));
        }
      });

      this.renderer.listen(validateBtn, 'click', () => {
        const amountInputValue = parseFloat(amountInput.value);
        const volumeInputValue = parseFloat(volumeInput.value);

        if (amountInputValue <= this.soldeCompte && this.selectedFuelType) {
          this.disableButtons(fuelBtn, selectElement);
          this.acheterCarburant(amountInputValue, volumeInputValue);
        } else {
          this.errorMessage = 'Erreur: Le montant dépasse le solde du compte.';
        }
      });

      this.renderer.listen(cancelBtn, 'click', () => {
        this.resetForm(amountInput, volumeInput, inputFields, fuelBtn, selectElement);
      });
    }
  }

  toggleFuelSelection(selectElement: HTMLSelectElement): void {
    this.selectedFuelType = selectElement.value as 'diesel' | 'gazoil' | 'huile' | 'autre';
    this.updateFuelDisplay(this.el.nativeElement.querySelector('#fuel-btn') as HTMLElement, selectElement);
    this.renderer.setStyle(this.el.nativeElement.querySelector('#input-fields') as HTMLElement, 'display', 'flex');
  }

  updateFuelDisplay(fuelBtn: HTMLElement, selectElement: HTMLSelectElement): void {
    this.renderer.setProperty(fuelBtn, 'innerHTML', `<i class="fas fa-gas-pump"></i> ${this.selectedFuelType.toUpperCase()}`);
    this.renderer.setStyle(fuelBtn, 'color', this.selectedFuelType === 'diesel' ? 'green' : 'brown');
  }

  calculateVolume(amount: number): number {
    const pricePerLiter = this.getPricePerLiter();
    return amount / pricePerLiter;
  }

  calculateAmount(volume: number): number {
    const pricePerLiter = this.getPricePerLiter();
    return volume * pricePerLiter;
  }

  getPricePerLiter(): number {
    switch (this.selectedFuelType) {
      case 'diesel':
        return this.dieselPricePerLiter;
      case 'gazoil':
        return this.gazoilPricePerLiter;
      case 'huile':
        return this.huilePricePerLiter;
      case 'autre':
        return this.autrePricePerLiter;
      default:
        return 0;
    }
  }

  disableButtons(fuelBtn: HTMLElement, selectElement: HTMLSelectElement) {
    this.renderer.setStyle(fuelBtn, 'opacity', '0.5');
    this.renderer.setStyle(fuelBtn, 'pointer-events', 'none');
    this.renderer.setStyle(selectElement, 'opacity', '0.5');
    this.renderer.setStyle(selectElement, 'pointer-events', 'none');
  }

  getUserBalance(userId: string): void {
    this.crudService.getUserBalance(userId).subscribe(
      (response) => {
        this.soldeCompte = response.solde; // Mettez à jour le solde localement
      },
      (error) => {
        console.error('Erreur lors de la récupération du solde:', error);
        this.errorMessage = 'Erreur lors de la récupération du solde. Veuillez réessayer.';
      }
    );
  }

  acheterCarburant(amount: number, volume: number): void {
    const userId = this.authService.getUserId(); // Récupérez l'ID de l'utilisateur connecté
    console.log('User ID:', userId);
    console.log('Carburant:', this.selectedFuelType);
    console.log('Montant:', amount);
    console.log('Volume:', volume);

    this.crudService.acheterCarburant(userId, this.selectedFuelType, volume, amount).subscribe(
      (response) => {
        console.log('Achat réussi:', response);
        this.getUserBalance(userId); // Récupérez le nouveau solde après l'achat
        this.resetFormAfterPurchase();
        this.startDecrement(amount, volume, this.el.nativeElement.querySelector('#amount') as HTMLInputElement, this.el.nativeElement.querySelector('#volume') as HTMLInputElement, this.el.nativeElement.querySelector('#input-fields') as HTMLElement, this.el.nativeElement.querySelector('#fuel-btn') as HTMLElement, this.el.nativeElement.querySelector('#fuel-select') as HTMLSelectElement);
      },
      (error) => {
        console.error('Erreur lors de l\'achat:', error);
        this.errorMessage = 'Erreur lors de l\'achat. Veuillez réessayer.';
      }
    );
  }

  resetFormAfterPurchase(): void {
    const amountInput = this.el.nativeElement.querySelector('#amount') as HTMLInputElement;
    const volumeInput = this.el.nativeElement.querySelector('#volume') as HTMLInputElement;
    const inputFields = this.el.nativeElement.querySelector('#input-fields') as HTMLElement;
    const fuelBtn = this.el.nativeElement.querySelector('#fuel-btn') as HTMLElement;
    const selectElement = this.el.nativeElement.querySelector('#fuel-select') as HTMLSelectElement;

    this.renderer.setProperty(amountInput, 'value', '');
    this.renderer.setProperty(volumeInput, 'value', '');
    this.errorMessage = '';
    this.renderer.setStyle(fuelBtn, 'opacity', '1');
    this.renderer.setStyle(fuelBtn, 'pointer-events', 'auto');
    this.renderer.setStyle(selectElement, 'opacity', '1');
    this.renderer.setStyle(selectElement, 'pointer-events', 'auto');
    this.updateFuelDisplay(fuelBtn, selectElement);
  }

  resetForm(amountInput: HTMLInputElement, volumeInput: HTMLInputElement, inputFields: HTMLElement, fuelBtn: HTMLElement, selectElement: HTMLSelectElement): void {
    this.renderer.setProperty(amountInput, 'value', '');
    this.renderer.setProperty(volumeInput, 'value', '');
    this.renderer.setStyle(inputFields, 'display', 'none');
    this.errorMessage = '';
    this.renderer.setStyle(fuelBtn, 'opacity', '1');
    this.renderer.setStyle(fuelBtn, 'pointer-events', 'auto');
    this.renderer.setStyle(selectElement, 'opacity', '1');
    this.renderer.setStyle(selectElement, 'pointer-events', 'auto');
    this.updateFuelDisplay(fuelBtn, selectElement);
    const logoutBtn = this.el.nativeElement.querySelector('#logout-btn') as HTMLElement;
    if (logoutBtn) {
      this.renderer.listen(logoutBtn, 'click', () => {
        this.logout();
      });
    }
  }

  logout(): void {
    this.authService.logout().subscribe(
      (response) => {
        console.log('Déconnexion réussie:', response);
        this.router.navigate(['/']);
      },
      (error) => {
        console.error('Erreur lors de la déconnexion:', error);
        this.errorMessage = 'Erreur lors de la déconnexion. Veuillez réessayer.';
      }
    );
  }

  // Gestion de la décrémentation en temps réel
  startDecrement(amount: number, volume: number, amountInput: HTMLInputElement, volumeInput: HTMLInputElement, inputFields: HTMLElement, fuelBtn: HTMLElement, selectElement: HTMLSelectElement) {
    console.log('Starting decrement:', { amount, volume });
    const pricePerLiter = this.getPricePerLiter();
    this.decrementInterval = setInterval(() => {
      if (amount > 0) {
        amount -= 1;
        if (amount % pricePerLiter === 0) {
          volume -= 1;
        }
        this.renderer.setProperty(amountInput, 'value', amount.toFixed(2));
        this.renderer.setProperty(volumeInput, 'value', volume.toFixed(2));
      } else {
        clearInterval(this.decrementInterval);
        this.resetForm(amountInput, volumeInput, inputFields, fuelBtn, selectElement);
      }
    }, 1);
  }
}
