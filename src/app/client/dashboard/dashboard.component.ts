import { Component, OnInit, OnDestroy, Renderer2, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CrudService } from '../../services/crud.service';
import { RfidService } from '../../services/rfid.service';
import { io } from 'socket.io-client';
import { Subscription } from 'rxjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  public fuelLevels = { essence: 0, gazole: 0 };
  private socket;

  carburant: string = '';
  msg: string = '';
  nom: string = '';
  role: string = '';
  showForm: boolean = false;
  public litresAchetes: number = 0;
  public montant: number = 0;
  public montantRestant: number = 0;
  public showSuccessModal: boolean = false;
  public showErrorModal: boolean = false;

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    private authService: AuthService,
    private router: Router,
    private crudService: CrudService,
    private rfidService: RfidService,
    private http: HttpClient
  ) {
    this.socket = io('http://localhost:5000'); // Connectez-vous au serveur WebSocket
  }

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
      cancelBtn: this.el.nativeElement.querySelector('#cancel-btn') as HTMLElement,
      errorMessage: this.el.nativeElement.querySelector('#error-message') as HTMLElement
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
          this.selectedFuelType = this.authService.getCarburant() as 'diesel' | 'gazoil' | 'huile' | 'autre';
          this.renderer.setStyle(elements.inputFields, 'display', 'flex');
          this.updateFuelDisplay(elements.fuelBtn, elements.selectElement);
        }
      },
      (error) => {
        console.error('Erreur lors de la lecture RFID:', error);
        this.setErrorMessage('❌ Erreur lors de la lecture RFID.');
      }
    );

    this.renderer.listen(elements.amountInput, 'input', (event: Event) => {
      const target = event.target as HTMLInputElement;
      const amount = parseFloat(target.value);
      if (isNaN(amount) || amount <= 0) {
        this.setErrorMessage('❌ Montant invalide. Veuillez entrer un montant positif.');
      } else if (amount > this.soldeCompte) {
        this.setErrorMessage('❌ Votre solde est insuffisant.');
      } else {
        this.setErrorMessage('');
      }
    });

    this.renderer.listen(elements.volumeInput, 'input', (event: Event) => {
      const target = event.target as HTMLInputElement;
      const volume = parseFloat(target.value);
      if (!isNaN(volume) && elements.amountInput) {
        const amount = this.calculateAmount(volume);
        this.renderer.setProperty(elements.amountInput, 'value', amount.toFixed(2));

        // Vérifiez si le montant calculé est supérieur au solde
        if (amount > this.soldeCompte) {
          this.setErrorMessage('❌ Votre solde est insuffisant pour ce volume.');
        } else {
          this.setErrorMessage('');
        }
      }
    });

    this.renderer.listen(elements.validateBtn, 'click', () => {
      const amountInputValue = parseFloat(elements.amountInput.value);
      const volumeInputValue = parseFloat(elements.volumeInput.value);

      if (isNaN(amountInputValue) || isNaN(volumeInputValue) || amountInputValue <= 0 || volumeInputValue <= 0) {
        this.setErrorMessage('❌ Veuillez entrer un montant et un volume valides.');
        return;
      }

      if (amountInputValue > this.soldeCompte) {
        this.setErrorMessage('❌ Erreur: Votre solde est insuffisant.');
        return;
      }

      this.disableButtons(elements.fuelBtn, elements.selectElement);
      this.acheterCarburant(amountInputValue, volumeInputValue);
    });

    this.renderer.listen(elements.cancelBtn, 'click', () => {
      this.resetForm(elements.amountInput, elements.volumeInput, elements.inputFields, elements.fuelBtn, elements.selectElement);
      this.setErrorMessage('');
    });

    this.renderer.listen(elements.selectElement, 'change', () => {
      this.toggleFuelSelection(elements.selectElement);
    });

    // Écouter les mises à jour des niveaux de carburant
    this.socket.on('fuelUpdate', (data) => {
      this.fuelLevels = data;
      console.log('Niveaux de carburant mis à jour:', this.fuelLevels);
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
        this.soldeCompte = response.solde; // Mettez à jour le solde localement
      },
      (error) => {
        console.error('Erreur lors de la récupération du solde:', error);
        this.setErrorMessage('Erreur lors de la récupération du solde. Veuillez réessayer.');
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

        // Envoyer la commande au serveur pour activer la pompe
        this.http.post('http://localhost:5000/api/activate-pump', { fuelType: this.selectedFuelType, volume }).subscribe(
          (response) => {
            console.log('Pompe activée:', response);
            this.showSuccessModal = true; // Afficher la modale de succès
            this.msg = 'Achat de carburant effectué avec succès';
            this.carburant = this.selectedFuelType;
            this.litresAchetes = volume;
            this.montant = amount;
            this.montantRestant = this.soldeCompte - amount;

            // Générer le PDF après l'affichage de la modale
            setTimeout(() => {
              this.generatePDF();
            }, 500); // Attendre un court instant pour s'assurer que la modale est rendue
          },
          (error) => {
            console.error('Erreur lors de l\'activation de la pompe:', error);
          }
        );
      },
      (error) => {
        console.error('Erreur lors de l\'achat:', error);
        this.setErrorMessage('Erreur lors de l\'achat. Veuillez réessayer.');
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
    this.setErrorMessage('');
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
        this.setErrorMessage('Erreur lors de la déconnexion. Veuillez réessayer.');
      }
    );
  }

  private isDecrementing = false;
  private hasSentStartCommand = false;
  private hasSentStopCommand = false;

  startDecrement(amount: number, volume: number, amountInput: HTMLInputElement, volumeInput: HTMLInputElement, inputFields: HTMLElement, fuelBtn: HTMLElement, selectElement: HTMLSelectElement) {
    if (this.isDecrementing) {
      console.log('Décrémentation déjà en cours.');
      return;
    }

    console.log('Starting decrement:', { amount, volume });
    const pricePerLiter = this.getPricePerLiter();
    const totalTime = volume * 1000; // Temps total en millisecondes
    let elapsedTime = 0;

    // Envoyer une commande à l'Arduino pour activer la pompe immédiatement
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
        this.resetForm(amountInput, volumeInput, inputFields, fuelBtn, selectElement);
      }
    }, 10); // Mettre à jour toutes les 10 millisecondes
  }

  stopDecrement() {
    if (this.isDecrementing && !this.hasSentStopCommand) {
      this.isDecrementing = false;
      clearInterval(this.decrementInterval);

      // Envoyer une commande à l'Arduino pour désactiver la pompe
      this.sendCommandToArduino('stop');
      this.hasSentStopCommand = true;
      this.hasSentStartCommand = false; // Réinitialiser l'indicateur de démarrage
    }
  }

  closeModal() {
    this.showSuccessModal = false;
    this.showErrorModal = false;
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

  generatePDF() {
    console.log('Génération du PDF...');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 120] // Format reçu (80mm x 120mm)
    });

    const centerX = pdf.internal.pageSize.getWidth() / 2; // Centre du ticket
    const marginLeft = 10; // Marge gauche pour les textes alignés
    let positionY = 10; // Position verticale

    // Ajouter un titre centré en gras
    pdf.setFont('courier', 'bold');
    pdf.setFontSize(14);
    pdf.text('SMARTFUEL', centerX, positionY, { align: 'center' });

    positionY += 8;
    pdf.setFontSize(10);
    pdf.setFont('courier', 'normal');
    pdf.text('Ticket de transaction', centerX, positionY, { align: 'center' });

    // Ajouter une ligne séparatrice
    positionY += 5;
    pdf.setLineWidth(0.5);
    pdf.line(5, positionY, 75, positionY);

    // Ajouter la date et l'heure
    const date = new Date().toLocaleString();
    positionY += 6;
    pdf.text(`Date: ${date}`, marginLeft, positionY);

    // Ajouter les détails de l'achat
    positionY += 8;
    pdf.setFont('courier', 'bold');
    pdf.text('Détails de l\'achat:', marginLeft, positionY);

    pdf.setFont('courier', 'normal');
    positionY += 6;
    pdf.text(`Carburant: ${this.carburant}`, marginLeft, positionY);

    positionY += 6;
    pdf.text(`Litres achetés: ${this.litresAchetes} L`, marginLeft, positionY);

    positionY += 6;
    pdf.text(`Montant: ${this.montant} FCFA`, marginLeft, positionY);

    positionY += 6;
    pdf.text(`Montant restant: ${this.montantRestant} FCFA`, marginLeft, positionY);

    // Ajouter une ligne séparatrice
    positionY += 8;
    pdf.setLineWidth(0.5);
    pdf.line(5, positionY, 75, positionY);

    // Message de remerciement
    positionY += 8;
    pdf.setFontSize(10);
    pdf.setFont('courier', 'bold');
    pdf.text('Merci pour votre achat !', centerX, positionY, { align: 'center' });

    positionY += 6;
    pdf.setFontSize(8);
    pdf.text('Conservez ce reçu comme preuve.', centerX, positionY, { align: 'center' });

    // Sauvegarder le PDF
    pdf.save('ticket_achat_carburant.pdf');
    console.log('PDF généré avec succès.');
  }

  private setErrorMessage(message: string): void {
    console.log('Erreur affichée :', message);
    this.errorMessage = message;
    const errorMessageElement = this.el.nativeElement.querySelector('#error-message') as HTMLElement;
    if (errorMessageElement) {
      this.renderer.setProperty(errorMessageElement, 'textContent', message);
      this.renderer.setStyle(errorMessageElement, 'color', 'red');
    }
  }
}
