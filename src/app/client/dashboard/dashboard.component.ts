import { Component, OnInit, Renderer2, ElementRef } from '@angular/core';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: []
})
export class ClientDashboardComponent implements OnInit {
  private dieselPricePerLiter = 1000;
  private gazoilPricePerLiter = 900;
  private selectedFuelType: 'diesel' | 'gazoil' = 'diesel'; // Initialisé à 'diesel'
  private soldeCompte = 100000;
  public errorMessage: string = '';
  private decrementInterval: any;

  constructor(private renderer: Renderer2, private el: ElementRef) {}

  ngOnInit(): void {
    // Récupération des éléments HTML
    const fuelBtn = this.el.nativeElement.querySelector('#fuel-btn');
    const selectBtn = this.el.nativeElement.querySelector('#select-btn');
    const inputFields = this.el.nativeElement.querySelector('#input-fields');
    const amountInput = this.el.nativeElement.querySelector('#amount');
    const volumeInput = this.el.nativeElement.querySelector('#volume');
    const validateBtn = this.el.nativeElement.querySelector('#validate-btn');
    const cancelBtn = this.el.nativeElement.querySelector('#cancel-btn');

    if (fuelBtn && selectBtn && inputFields && amountInput && volumeInput && validateBtn && cancelBtn) {
      // Initialisation de l'affichage
      this.updateFuelDisplay(fuelBtn, selectBtn);

      // Ajout des écouteurs d'événements pour la sélection du carburant
      this.renderer.listen(fuelBtn, 'click', () => {
        this.toggleFuelSelection(selectBtn, fuelBtn, inputFields);
      });

      this.renderer.listen(selectBtn, 'click', () => {
        this.toggleFuelSelection(selectBtn, fuelBtn, inputFields);
      });

      // Gestion de la saisie du montant pour calculer le volume correspondant
      this.renderer.listen(amountInput, 'input', (event: Event) => {
        const target = event.target as HTMLInputElement;
        const amount = parseFloat(target.value);
        const volume = this.calculateVolume(amount);

        if (volumeInput) {
          this.renderer.setProperty(volumeInput, 'value', volume.toFixed(2));
        }

        // Vérification du solde du compte
        if (amount > this.soldeCompte) {
          this.errorMessage = 'Le montant dépasse le solde de votre compte.';
        } else {
          this.errorMessage = '';
        }
      });

      // Gestion de la saisie du volume pour calculer le montant correspondant
      this.renderer.listen(volumeInput, 'input', (event: Event) => {
        const target = event.target as HTMLInputElement;
        const volume = parseFloat(target.value);
        const amount = this.calculateAmount(volume);

        if (amountInput) {
          this.renderer.setProperty(amountInput, 'value', amount.toFixed(2));
        }
      });

      // Validation de la transaction
      this.renderer.listen(validateBtn, 'click', () => {
        const amountInputValue = parseFloat(amountInput.value);
        const volumeInputValue = parseFloat(volumeInput.value);

        if (amountInputValue <= this.soldeCompte && this.selectedFuelType) {
          this.disableButtons(fuelBtn, selectBtn);
          this.startDecrement(amountInputValue, volumeInputValue, amountInput, volumeInput, inputFields, fuelBtn, selectBtn);
        } else {
          this.errorMessage = 'Erreur: Le montant dépasse le solde du compte.';
        }
      });

      // Annulation de la transaction
      this.renderer.listen(cancelBtn, 'click', () => {
        this.resetForm(amountInput, volumeInput, inputFields, fuelBtn, selectBtn);
      });
    }
  }

  // Fonction pour gérer la sélection du type de carburant
  toggleFuelSelection(selectBtn: HTMLElement, fuelBtn: HTMLElement, inputFields: HTMLElement): void {
    this.selectedFuelType = this.selectedFuelType === 'diesel' ? 'gazoil' : 'diesel';
    this.updateFuelDisplay(fuelBtn, selectBtn);
    this.renderer.setStyle(inputFields, 'display', 'flex');
  }

  // Mettre à jour l'affichage des boutons en fonction du type de carburant sélectionné
  updateFuelDisplay(fuelBtn: HTMLElement, selectBtn: HTMLElement): void {
    const otherFuelType = this.selectedFuelType === 'diesel' ? 'gazoil' : 'diesel';
    this.renderer.setProperty(fuelBtn, 'innerHTML', `<i class="fas fa-gas-pump"></i> ${this.selectedFuelType.toUpperCase()}`);
    this.renderer.setProperty(selectBtn, 'innerHTML', otherFuelType.toUpperCase());
    this.renderer.setStyle(fuelBtn, 'color', this.selectedFuelType === 'diesel' ? 'green' : 'red');
  }

  // Calcul du volume en fonction du montant
  calculateVolume(amount: number): number {
    const pricePerLiter = this.selectedFuelType === 'diesel' ? this.dieselPricePerLiter : this.gazoilPricePerLiter;
    return amount / pricePerLiter;
  }

  // Calcul du montant en fonction du volume
  calculateAmount(volume: number): number {
    const pricePerLiter = this.selectedFuelType === 'diesel' ? this.dieselPricePerLiter : this.gazoilPricePerLiter;
    return volume * pricePerLiter;
  }

  // Désactivation des boutons de sélection du carburant
  disableButtons(fuelBtn: HTMLElement, selectBtn: HTMLElement) {
    this.renderer.setStyle(fuelBtn, 'opacity', '0.5');
    this.renderer.setStyle(fuelBtn, 'pointer-events', 'none');
    this.renderer.setStyle(selectBtn, 'opacity', '0.5');
    this.renderer.setStyle(selectBtn, 'pointer-events', 'none');
  }

  // Gestion de la décrémentation en temps réel
  startDecrement(amount: number, volume: number, amountInput: HTMLInputElement, volumeInput: HTMLInputElement, inputFields: HTMLElement, fuelBtn: HTMLElement, selectBtn: HTMLElement) {
    const pricePerLiter = this.selectedFuelType === 'diesel' ? this.dieselPricePerLiter : this.gazoilPricePerLiter;
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
        this.resetForm(amountInput, volumeInput, inputFields, fuelBtn, selectBtn);
      }
    }, 1);
  }

  // Réinitialisation du formulaire après l'annulation ou la fin de la transaction
  resetForm(amountInput: HTMLInputElement, volumeInput: HTMLInputElement, inputFields: HTMLElement, fuelBtn: HTMLElement, selectBtn: HTMLElement): void {
    this.renderer.setProperty(amountInput, 'value', '');
    this.renderer.setProperty(volumeInput, 'value', '');
    this.renderer.setStyle(inputFields, 'display', 'none');
    this.errorMessage = '';
    this.renderer.setStyle(fuelBtn, 'opacity', '1');
    this.renderer.setStyle(fuelBtn, 'pointer-events', 'auto');
    this.renderer.setStyle(selectBtn, 'opacity', '1');
    this.renderer.setStyle(selectBtn, 'pointer-events', 'auto');
    this.updateFuelDisplay(fuelBtn, selectBtn);
  }
}
