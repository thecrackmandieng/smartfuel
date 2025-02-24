import { Component, OnInit, Renderer2, ElementRef } from '@angular/core';

@Component({
  selector: 'app-pompiste-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: []
})
export class PompisteDashboardComponent implements OnInit {
  // Définition des prix des carburants
  private dieselPricePerLiter = 1000;
  private gazoilPricePerLiter = 900;
  private selectedFuelType: string | null = null;
  private soldeCompte = 100000; // Solde initial du compte
  public errorMessage: string = '';
  private decrementInterval: any;

  constructor(private renderer: Renderer2, private el: ElementRef) {}

  ngOnInit(): void {
    // Récupération des éléments HTML
    const dieselBtn = this.el.nativeElement.querySelector('#diesel-btn');
    const gazoilBtn = this.el.nativeElement.querySelector('#gazoil-btn');
    const inputFields = this.el.nativeElement.querySelector('#input-fields');
    const amountInput = this.el.nativeElement.querySelector('#amount');
    const volumeInput = this.el.nativeElement.querySelector('#volume');
    const validateBtn = this.el.nativeElement.querySelector('#validate-btn');
    const cancelBtn = this.el.nativeElement.querySelector('#cancel-btn');

    if (dieselBtn && gazoilBtn && inputFields && amountInput && volumeInput && validateBtn && cancelBtn) {
      // Ajout des écouteurs d'événements pour la sélection du carburant
      this.renderer.listen(dieselBtn, 'click', () => {
        this.toggleFuelSelection('diesel', dieselBtn, gazoilBtn, inputFields);
      });

      this.renderer.listen(gazoilBtn, 'click', () => {
        this.toggleFuelSelection('gazoil', gazoilBtn, dieselBtn, inputFields);
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
    
          
          
          this.disableButtons(dieselBtn, gazoilBtn);
          this.startDecrement(amountInputValue, volumeInputValue, amountInput, volumeInput, inputFields, dieselBtn, gazoilBtn);
        } else {
          this.errorMessage = 'Erreur: Le montant dépasse le solde du compte.';
        }
      });

      // Annulation de la transaction
      this.renderer.listen(cancelBtn, 'click', () => {
        this.resetForm(amountInput, volumeInput, inputFields, dieselBtn, gazoilBtn);
      });
    }
  }

  // Fonction pour gérer la sélection du type de carburant
  toggleFuelSelection(fuelType: string, activeBtn: HTMLElement, inactiveBtn: HTMLElement, inputFields: HTMLElement): void {
    this.selectedFuelType = fuelType;
    this.renderer.setStyle(inputFields, 'display', 'flex');
    this.renderer.setStyle(activeBtn, 'transform', 'scale(0.8)');
    this.renderer.setStyle(inactiveBtn, 'opacity', '0.5');
    this.renderer.setStyle(inactiveBtn, 'pointer-events', 'none');
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
  disableButtons(dieselBtn: HTMLElement, gazoilBtn: HTMLElement) {
    this.renderer.setStyle(dieselBtn, 'opacity', '0.5');
    this.renderer.setStyle(dieselBtn, 'pointer-events', 'none');
    this.renderer.setStyle(gazoilBtn, 'opacity', '0.5');
    this.renderer.setStyle(gazoilBtn, 'pointer-events', 'none');
  }

  // Gestion de la décrémentation en temps réel
  startDecrement(amount: number, volume: number, amountInput: HTMLInputElement, volumeInput: HTMLInputElement, inputFields: HTMLElement, dieselBtn: HTMLElement, gazoilBtn: HTMLElement) {
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
        this.resetForm(amountInput, volumeInput, inputFields, dieselBtn, gazoilBtn);
      }
    }, 1);
  }

  // Réinitialisation du formulaire après l'annulation ou la fin de la transaction
  resetForm(amountInput: HTMLInputElement, volumeInput: HTMLInputElement, inputFields: HTMLElement, dieselBtn: HTMLElement, gazoilBtn: HTMLElement): void {
    this.renderer.setProperty(amountInput, 'value', '');
    this.renderer.setProperty(volumeInput, 'value', '');
    this.renderer.setStyle(inputFields, 'display', 'none');
    this.errorMessage = ''; 
    this.selectedFuelType = null;
    this.renderer.setStyle(dieselBtn, 'opacity', '1');
    this.renderer.setStyle(dieselBtn, 'pointer-events', 'auto');
    this.renderer.setStyle(gazoilBtn, 'opacity', '1');
    this.renderer.setStyle(gazoilBtn, 'pointer-events', 'auto');
  }
}