
import { Component, OnInit, Renderer2, ElementRef } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-pompiste-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [AuthService, Router, HttpClient]
})
export class PompisteDashboardComponent implements OnInit {
  private dieselPricePerLiter = 1000;
  private gazoilPricePerLiter = 900;
  private selectedFuelType: string | null = null;
  private soldeCompte = 100000; // Solde initial du compte
  public errorMessage: string = '';
  private decrementInterval: any;
  private isDecrementing = false;

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const dieselBtn = this.el.nativeElement.querySelector('#diesel-btn');
    const gazoilBtn = this.el.nativeElement.querySelector('#gazoil-btn');
    const inputFields = this.el.nativeElement.querySelector('#input-fields');
    const amountInput = this.el.nativeElement.querySelector('#amount');
    const volumeInput = this.el.nativeElement.querySelector('#volume');
    const validateBtn = this.el.nativeElement.querySelector('#validate-btn');
    const cancelBtn = this.el.nativeElement.querySelector('#cancel-btn');

    if (dieselBtn && gazoilBtn && inputFields && amountInput && volumeInput && validateBtn && cancelBtn) {
      this.renderer.listen(dieselBtn, 'click', () => {
        this.toggleFuelSelection('diesel', dieselBtn, gazoilBtn, inputFields);
      });

      this.renderer.listen(gazoilBtn, 'click', () => {
        this.toggleFuelSelection('gazoil', gazoilBtn, dieselBtn, inputFields);
      });

      this.renderer.listen(amountInput, 'input', (event: Event) => {
        const target = event.target as HTMLInputElement;
        const amount = parseFloat(target.value);
        const volume = this.calculateVolume(amount);

        if (volumeInput) {
          this.renderer.setProperty(volumeInput, 'value', volume.toFixed(2));
        }

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
          this.disableButtons(dieselBtn, gazoilBtn);
          this.startDecrement(amountInputValue, volumeInputValue, amountInput, volumeInput, inputFields, dieselBtn, gazoilBtn);
        } else {
          this.errorMessage = 'Erreur: Le montant dépasse le solde du compte.';
        }
      });

      this.renderer.listen(cancelBtn, 'click', () => {
        this.resetForm(amountInput, volumeInput, inputFields, dieselBtn, gazoilBtn);
      });
    }

    const logoutBtn = this.el.nativeElement.querySelector('#logout-btn');
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

  toggleFuelSelection(fuelType: string, activeBtn: HTMLElement, inactiveBtn: HTMLElement, inputFields: HTMLElement): void {
    this.selectedFuelType = fuelType;
    this.renderer.setStyle(inputFields, 'display', 'flex');
    this.renderer.setStyle(activeBtn, 'transform', 'scale(0.8)');
    this.renderer.setStyle(inactiveBtn, 'opacity', '0.5');
    this.renderer.setStyle(inactiveBtn, 'pointer-events', 'none');
  }

  calculateVolume(amount: number): number {
    const pricePerLiter = this.selectedFuelType === 'diesel' ? this.dieselPricePerLiter : this.gazoilPricePerLiter;
    return amount / pricePerLiter;
  }

  calculateAmount(volume: number): number {
    const pricePerLiter = this.selectedFuelType === 'diesel' ? this.dieselPricePerLiter : this.gazoilPricePerLiter;
    return volume * pricePerLiter;
  }

  disableButtons(dieselBtn: HTMLElement, gazoilBtn: HTMLElement) {
    this.renderer.setStyle(dieselBtn, 'opacity', '0.5');
    this.renderer.setStyle(dieselBtn, 'pointer-events', 'none');
    this.renderer.setStyle(gazoilBtn, 'opacity', '0.5');
    this.renderer.setStyle(gazoilBtn, 'pointer-events', 'none');
  }

  startDecrement(amount: number, volume: number, amountInput: HTMLInputElement, volumeInput: HTMLInputElement, inputFields: HTMLElement, dieselBtn: HTMLElement, gazoilBtn: HTMLElement) {
    if (this.isDecrementing) {
      console.log('Décrémentation déjà en cours.');
      return;
    }

    console.log('Starting decrement:', { amount, volume });
    const pricePerLiter = this.selectedFuelType === 'diesel' ? this.dieselPricePerLiter : this.gazoilPricePerLiter;
    const totalTime = volume * 1000; // Temps total en millisecondes
    let elapsedTime = 0;

    // Envoyer une commande à l'Arduino pour activer la pompe
    this.sendCommandToArduino(`${this.selectedFuelType}:${volume}`);

    this.isDecrementing = true;

    this.decrementInterval = setInterval(() => {
      elapsedTime += 10; // Incrémente le temps écoulé de 10 millisecondes
      const remainingVolume = volume * (1 - (elapsedTime / totalTime));
      const remainingAmount = remainingVolume * pricePerLiter;

      this.renderer.setProperty(amountInput, 'value', remainingAmount.toFixed(2));
      this.renderer.setProperty(volumeInput, 'value', remainingVolume.toFixed(2));

      if (elapsedTime >= totalTime) {
        clearInterval(this.decrementInterval);
        this.isDecrementing = false;
        this.resetForm(amountInput, volumeInput, inputFields, dieselBtn, gazoilBtn);

        // Envoyer une commande à l'Arduino pour désactiver la pompe
        this.sendCommandToArduino('stop');
      }
    }, 10); // Mettre à jour toutes les 10 millisecondes
  }

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

  sendCommandToArduino(command: string) {
    // Envoyer la commande à l'Arduino via HTTP
    this.http.post('http://localhost:5000/api/arduino-command', { command }).subscribe(
      (response) => {
        console.log('Commande envoyée à Arduino:', response);
      },
      (error) => {
        console.error('Erreur lors de l\'envoi de la commande à Arduino:', error);
      }
    );
  }
}
