import { Component, OnInit, Renderer2, ElementRef } from '@angular/core';

@Component({
  selector: 'app-pompiste-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: []
})
export class PompisteDashboardComponent implements OnInit {
  private dieselPricePerLiter = 1000; // Adjust as needed
  private gazoilPricePerLiter = 1200; // Adjust as needed
  private selectedFuelType: string | null = null;

  constructor(private renderer: Renderer2, private el: ElementRef) {}

  ngOnInit(): void {
    const dieselBtn = this.el.nativeElement.querySelector('#diesel-btn');
    const gazoilBtn = this.el.nativeElement.querySelector('#gazoil-btn');
    const amountInput = this.el.nativeElement.querySelector('#amount');
    const volumeInput = this.el.nativeElement.querySelector('#volume');

    if (dieselBtn && gazoilBtn && amountInput && volumeInput) {

      this.renderer.listen(dieselBtn, 'click', () => {
        console.log('Diesel button clicked');
        this.toggleFuelSelection('diesel');
      });

      this.renderer.listen(gazoilBtn, 'click', () => {
        console.log('Gazoil button clicked');
        this.toggleFuelSelection('gazoil');
      });

      this.renderer.listen(amountInput, 'input', (event: Event) => {
        const target = event.target as HTMLInputElement;
        const amount = parseFloat(target.value);
        const volume = this.calculateVolume(amount);
        if (volumeInput) {
          this.renderer.setProperty(volumeInput, 'value', volume.toFixed(2));
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
    } 
  }

  toggleFuelSelection(fuelType: string): void {
    const dieselBtn = this.el.nativeElement.querySelector('#diesel-btn');
    const gazoilBtn = this.el.nativeElement.querySelector('#gazoil-btn');
    const inputFields = this.el.nativeElement.querySelector('#input-fields');
  
    if (dieselBtn && gazoilBtn && inputFields) {
      console.log('Toggling fuel selection:', fuelType);
      this.selectedFuelType = fuelType;
  
      // Activer le formulaire
      this.renderer.setStyle(inputFields, 'display', 'flex');
  
      // Activer/Désactiver les boutons
      if (fuelType === 'diesel') {
        this.renderer.setProperty(dieselBtn, 'disabled', false);
        this.renderer.setProperty(gazoilBtn, 'disabled', true);
      } else {
        this.renderer.setProperty(dieselBtn, 'disabled', true);
        this.renderer.setProperty(gazoilBtn, 'disabled', false);
      }
    }
  }
  

  calculateVolume(amount: number): number {
    if (this.selectedFuelType === 'diesel') {
      return amount / this.dieselPricePerLiter;
    } else if (this.selectedFuelType === 'gazoil') {
      return amount / this.gazoilPricePerLiter;
    } else {
      return 0;
    }
  }

  calculateAmount(volume: number): number {
    if (this.selectedFuelType === 'diesel') {
      return volume * this.dieselPricePerLiter;
    } else if (this.selectedFuelType === 'gazoil') {
      return volume * this.gazoilPricePerLiter;
    } else {
      return 0;
    }
  }
}