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
  credentials = { code1: '', code2: '', code3: '', code4: '' };
  errorMessage: string | null = null;
  incorrectAttempts = 0;
  isLocked = false;
  lockTimeLeft = 15;
  progress = 100;

  constructor(private authService: AuthService, private router: Router) {}

  ngAfterViewInit(): void {
    this.input1.nativeElement.focus();
  }

  onInputChange(event: any, controlName: string, nextInput: any): void {
    const input = event.target;
    if (input.value.length === 1 && nextInput) {
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
      this.authService.authenticate(code).subscribe(
        (response) => {
          if (response.success) {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.handleIncorrectAttempt();
            this.errorMessage = 'Code incorrect';
          }
        },
        () => {
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
    }, 1000); // 1 second
  }

  clearInputs(): void {
    this.credentials = { code1: '', code2: '', code3: '', code4: '' };
    if (!this.isLocked) {
      this.input1.nativeElement.focus();
    }
  }
}