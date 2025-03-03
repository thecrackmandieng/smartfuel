import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RfidService } from '../../services/rfid.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  @ViewChild('input1') input1!: ElementRef;
  @ViewChild('input2') input2!: ElementRef;
  @ViewChild('input3') input3!: ElementRef;
  @ViewChild('input4') input4!: ElementRef;

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

  constructor(private authService: AuthService, private router: Router, private rfidService: RfidService) {}

  ngAfterViewInit(): void {
    this.input1.nativeElement.focus();

    this.rfidService.listenForScan().subscribe(
        (user) => {
            console.log(`Utilisateur détecté: ${user.nom} - Rôle: ${user.role}`);

            // Vérifiez si localStorage est disponible avant de l'utiliser
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('userRole', user.role);
            } else {
                console.error('localStorage n\'est pas disponible dans cet environnement.');
            }

            if (user.role === 'admin') {
                this.router.navigate(['admin/dashboard']);
            } else {
                console.log(`Accès refusé : vous n'êtes pas admin.`);
                this.showError('Accès refusé : utilisateur non admin.');
            }

            this.incorrectAttempts = 0;
        },
        (error) => {
            console.error('Erreur lors de la lecture RFID:', error);
            this.showError('Erreur lors de la lecture RFID.');
        }
    );

    this.rfidService.listenForErrors().subscribe(
        (errorMessage: string) => {
            this.showError(errorMessage);
        }
    );
}

  onInputChange(event: any, controlName: 'code1' | 'code2' | 'code3' | 'code4', nextInput: any): void {
    const input = event.target;
    const value = input.value;

    if (value.length === 1) {
      this.credentials[controlName] = value;
    }

    if (nextInput) {
      nextInput.focus();
    }

    this.checkAndSubmit();
  }

  filterInput(event: KeyboardEvent, controlName: string, input: any, prevInput: any): void {
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'];

    if (!allowedKeys.includes(event.key) && !/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    } else if (event.key === 'Backspace' && input.value === '' && prevInput) {
      prevInput.focus();
    }
  }

  showTemporaryValue(input: any): void {
    input.select();
    input.select();
  }

  checkAndSubmit(): void {
    const code = this.credentials.code1 + this.credentials.code2 + this.credentials.code3 + this.credentials.code4;
    if (code.length === 4) {
      this.onSubmit();
    }
  }

  onSubmit(): void {
    const code = this.credentials.code1 + this.credentials.code2 + this.credentials.code3 + this.credentials.code4;

    if (code) {
        this.authService.authenticate({ codeSecret: code }).subscribe(
            (response) => {
                if (response.msg === 'Connexion réussie') {
                    const role = response.role;
                    const token = response.token;

                    if (typeof localStorage !== 'undefined') {
                        localStorage.setItem('token', token);
                        localStorage.setItem('userRole', role);
                    } else {
                        console.error('localStorage n\'est pas disponible dans cet environnement.');
                    }

                    if (role === "admin") {
                        setTimeout(() => {
                            this.router.navigate(['/admin/dashboard']);
                        }, 100);
                    } else if (role === "pompiste") {
                        setTimeout(() => {
                            this.router.navigate(['/pompiste/dashboard']);
                        }, 100);
                    } else if (role === "client") {
                        setTimeout(() => {
                            this.router.navigate(['/client/dashboard']);
                        }, 100);
                    } else {
                        this.errorMessage = 'Accès non autorisé pour ce rôle';
                    }

                    this.incorrectAttempts = 0;
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
        this.errorMessage = null;
        this.errorMessage = null;
        this.clearInputs();
      }
    }, 1000);
  }

  showError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = null;
    }, 5000);
  }

  clearInputs(): void {
    this.credentials = { code1: '', code2: '', code3: '', code4: '' };
    if (this.input1 && this.input1.nativeElement) {
      this.input1.nativeElement.focus();
      this.input1.nativeElement.focus();
    }
  }
}