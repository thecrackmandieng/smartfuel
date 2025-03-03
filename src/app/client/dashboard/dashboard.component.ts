import { Component, OnInit, Renderer2, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CrudService } from '../../services/crud.service';
import { RfidService } from '../../services/rfid.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule, HttpClientModule]
})
export class ClientDashboardComponent implements OnInit, OnDestroy {
  private dieselPricePerLiter = 1000;
  private gazoilPricePerLiter = 900;
  private huilePricePerLiter = 1100;
  private autrePricePerLiter = 1200;
  private selectedFuelType: 'diesel' | 'gazoil' | 'huile' | 'autre' = 'diesel';
  public availableFuelTypes = ['diesel', 'gazoil', 'huile', 'autre'];
  public soldeCompte = 0;
  public errorMessage: string = '';
  private decrementInterval: any;
  public isLoggedIn: boolean = false;
  private rfidSubscription!: Subscription;

  nom: string = '';
  role: string = '';
  showForm: boolean = false;

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    private authService: AuthService,
    private router: Router,
    private crudService: CrudService,
    private rfidService: RfidService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    const userId = this.authService.getUserId();
    if (userId) {
      this.getUserBalance(userId);
    }

    const elements = {
      fuelBtn: this.el.nativeElement.querySelector('#fuel-btn') as HTMLElement,
      selectElement: this.el.nativeElement.querySelector('#fuel-select') as HTMLSelectElement,
      inputFields: this.el.nativeElement.querySelector('#input-fields') as HTMLElement,
      amountInput: this.el.nativeElement.querySelector('#amount') as HTMLInputElement,
      volumeInput: this.el.nativeElement.querySelector('#volume') as HTMLInputElement,
      validateBtn: this.el.nativeElement.querySelector('#validate-btn') as HTMLElement,
      cancelBtn: this.el.nativeElement.querySelector('#cancel-btn') as HTMLElement
    };

    if (Object.values(elements).some(el => !el)) return;

    this.updateFuelDisplay(elements.fuelBtn, elements.selectElement);
    this.applyStylesToSelect(elements.selectElement);

    this.rfidSubscription = this.rfidService.listenForScan().subscribe(
      (user) => {
        console.log('🆔 Utilisateur détecté via RFID:', user);
        this.nom = user.nom;
        this.role = user.role;

        if (this.role === 'client') {
          this.showForm = true;
          this.renderer.setStyle(elements.inputFields, 'display', 'flex');
          this.updateFuelDisplay(elements.fuelBtn, elements.selectElement);
        }
      },
      (error) => {
        console.error('Erreur lors de la lecture RFID:', error);
        this.errorMessage = 'Erreur lors de la lecture RFID.';
      }
    );

    this.renderer.listen(elements.amountInput, 'input', (event: Event) => {
      const target = event.target as HTMLInputElement;
      const amount = parseFloat(target.value);
      if (isNaN(amount) || amount <= 0) {
        this.errorMessage = 'Montant invalide';
      } else if (amount > this.soldeCompte) {
        this.errorMessage = 'Le montant dépasse le solde du compte.';
      } else {
        this.errorMessage = '';
      }
    });

    this.renderer.listen(elements.volumeInput, 'input', (event: Event) => {
      const target = event.target as HTMLInputElement;
      const volume = parseFloat(target.value);
      if (!isNaN(volume) && elements.amountInput) {
        this.renderer.setProperty(elements.amountInput, 'value', this.calculateAmount(volume).toFixed(2));
      }
    });

    this.renderer.listen(elements.validateBtn, 'click', () => {
      const amountInputValue = parseFloat(elements.amountInput.value);
      const volumeInputValue = parseFloat(elements.volumeInput.value);

      if (isNaN(amountInputValue) || isNaN(volumeInputValue) || amountInputValue <= 0 || volumeInputValue <= 0) {
        this.errorMessage = 'Veuillez entrer un montant et un volume valides.';
        return;
      }

      if (amountInputValue > this.soldeCompte) {
        this.errorMessage = 'Erreur: Le montant dépasse le solde du compte.';
        return;
      }

      this.disableButtons(elements.fuelBtn, elements.selectElement);
      this.acheterCarburant(amountInputValue, volumeInputValue);
    });

    this.renderer.listen(elements.cancelBtn, 'click', () => {
      this.resetForm(elements.amountInput, elements.volumeInput, elements.inputFields, elements.fuelBtn, elements.selectElement);
    });
  }

  ngOnDestroy(): void {
    if (this.rfidSubscription) {
      this.rfidSubscription.unsubscribe();
    }
  }

  private applyStylesToSelect(selectElement: HTMLSelectElement): void {
    const styles = {
      'background-color': 'green',
      'color': 'white',
      'border': 'none',
      'padding': '10px',
      'font-size': '16px',
      'cursor': 'pointer',
      'box-shadow': '0 4px 6px rgba(0, 0, 0, 0.1)',
      'transition': 'box-shadow 0.3s ease',
      'border-radius': '4px'
    };

    Object.entries(styles).forEach(([key, value]) => {
      this.renderer.setStyle(selectElement, key, value);
    });

    this.renderer.listen(selectElement, 'mouseover', () => {
      this.renderer.setStyle(selectElement, 'box-shadow', '0 6px 8px rgba(0, 0, 0, 0.2)');
    });

    this.renderer.listen(selectElement, 'mouseout', () => {
      this.renderer.setStyle(selectElement, 'box-shadow', '0 4px 6px rgba(0, 0, 0, 0.1)');
    });
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
        this.soldeCompte = response.solde;
      },
      (error) => {
        console.error('Erreur lors de la récupération du solde:', error);
        this.errorMessage = 'Erreur lors de la récupération du solde. Veuillez réessayer.';
      }
    );
  }

  acheterCarburant(amount: number, volume: number): void {
    const userId = this.authService.getUserId();
    console.log('User ID:', userId);
    console.log('Carburant:', this.selectedFuelType);
    console.log('Montant:', amount);
    console.log('Volume:', volume);

    this.crudService.acheterCarburant(userId, this.selectedFuelType, volume, amount).subscribe(
      (response) => {
        console.log('Achat réussi:', response);
        this.getUserBalance(userId);
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
    this.setErrorMessage('');
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
