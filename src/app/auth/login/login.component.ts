import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements AfterViewInit {
  @ViewChild('input1') input1!: ElementRef;

  // Typage des credentials pour accepter uniquement les clés 'code1', 'code2', 'code3', 'code4'
  credentials: { [key in 'code1' | 'code2' | 'code3' | 'code4']: string } = {
    code1: '',
    code2: '',
    code3: '',
    code4: ''
  };

  errorMessage: string | null = null;
  incorrectAttempts = 0;
  isLocked = false;
  lockTimeLeft = 15;
  progress = 100;

  constructor(private authService: AuthService, private router: Router) {}

  ngAfterViewInit(): void {
    this.input1.nativeElement.focus(); // Focus initial sur le premier champ
  }

  // Changement de typage pour 'controlName' afin qu'il soit l'une des clés de credentials
  onInputChange(event: any, controlName: 'code1' | 'code2' | 'code3' | 'code4', nextInput: any): void {
    const input = event.target;
    const value = input.value;

    // Si la longueur de la valeur est 1, mettre à jour la valeur correspondante
    if (value.length === 1) {
      this.credentials[controlName] = value; // Mettre à jour credentials avec la valeur entrée
    }

    // Si une autre entrée existe, passer au champ suivant
    if (nextInput) {
      nextInput.focus();
    }

    this.checkAndSubmit();
  }

  filterInput(event: KeyboardEvent, controlName: string, input: any, prevInput: any): void {
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'];

    // Ne permettre que les chiffres ou certaines touches comme backspace
    if (!allowedKeys.includes(event.key) && !/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    } else if (event.key === 'Backspace' && input.value === '' && prevInput) {
      // Si backspace et champ vide, revenir au champ précédent
      prevInput.focus();
    }
  }

  showTemporaryValue(input: any): void {
    input.select(); // Sélectionner la valeur pour une édition facile
  }

  checkAndSubmit(): void {
    const code = this.credentials.code1 + this.credentials.code2 + this.credentials.code3 + this.credentials.code4;
    // Si tous les champs sont remplis, soumettre le formulaire
    if (code.length === 4) {
      this.onSubmit();
    }
  }

  onSubmit(): void {
    const code = this.credentials.code1 + this.credentials.code2 + this.credentials.code3 + this.credentials.code4;

    console.log('Code envoyé:', code);  // Vérification

    if (code) {
        this.authService.authenticate({ codeSecret: code }).subscribe(
            (response) => {
                console.log('Réponse API:', response);  // Vérification de la réponse

                if (response.msg === 'Connexion réussie') {
                    // Vérifiez le rôle dans la réponse
                    const role = response.role; // Assurez-vous que la réponse inclut le rôle
                    if (role === "admin") {
                        setTimeout(() => {
                            this.router.navigate(['/admin/dashboard']); // Redirection vers la page admin/dashboard
                        }, 100);
                    } else if (role === "pompiste") {
                      console.log('Redirection vers /admin/pompiste'); // Vérification
                        setTimeout(() => {
                            this.router.navigate(['pompiste/dashboard']); // Redirection vers la page admin/pompiste
                        }, 100);
                    } else {
                        // Gérer d'autres rôles si nécessaire
                        this.errorMessage = 'Accès non autorisé pour ce rôle';
                    }
                } else {
                    this.handleIncorrectAttempt();
                    this.errorMessage = 'Code incorrect';
                }
            },
            (error) => {
                console.error('Erreur API:', error);
                this.handleIncorrectAttempt();
                this.errorMessage = 'Erreur de connexion';
            }
        );
    } else {
        this.clearInputs();
        this.errorMessage = 'Veuillez entrer un code';
    }
}


  handleIncorrectAttempt(): void {
    this.incorrectAttempts++;
    if (this.incorrectAttempts >= 3) {
      this.lockInputs();
    } else {
      this.clearInputs();
    }
  }

  lockInputs(): void {
    this.isLocked = true;
    this.lockTimeLeft = 15;
    this.progress = 100;
    const interval = setInterval(() => {
      this.lockTimeLeft--;
      this.progress = (this.lockTimeLeft / 15) * 100;
      if (this.lockTimeLeft <= 0) {
        clearInterval(interval);
        this.isLocked = false;
        this.errorMessage = null; // Réinitialiser le message d'erreur
        this.clearInputs();
      }
    }, 1000); // 1 seconde
  }

  clearInputs(): void {
    this.credentials = { code1: '', code2: '', code3: '', code4: '' };
    // Vérifiez si input1 est défini avant de l'utiliser
    if (this.input1 && this.input1.nativeElement) {
      this.input1.nativeElement.focus(); // Revenir au premier champ si pas verrouillé
    }
  }
  
}
