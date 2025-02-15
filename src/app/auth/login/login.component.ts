import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentials = { code1: '', code2: '', code3: '', code4: '' };

  constructor(private authService: AuthService, private router: Router) {}

  onInputChange(event: any, controlName: string, nextInput: any): void {
    const input = event.target;
    if (input.value.length === 1 && nextInput) {
      nextInput.focus();
    }
  }

  filterInput(event: KeyboardEvent, controlName: string, input: any): void {
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'];
    if (!allowedKeys.includes(event.key) && !/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  showTemporaryValue(input: any): void {
    input.select();
  }

  onSubmit(): void {
    const code = this.credentials.code1 + this.credentials.code2 + this.credentials.code3 + this.credentials.code4;
    if (code) {
      this.authService.authenticate(code).subscribe(
        (response) => {
          if (response.success) {
            this.router.navigate(['/admin/dashboard']);
          } else {
            alert('Code incorrect');
          }
        },
        () => {
          alert('Erreur de connexion');
        }
      );
    } else {
      alert('Veuillez entrer un code');
    }
  }
}