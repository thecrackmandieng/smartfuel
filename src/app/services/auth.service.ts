import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {}

  // Retourne un Observable avec des données fictives
  authenticate(code: string): Observable<any> {
    if (code === '1234') {
      return of({ success: true });
    } else {
      return of({ success: false });
    }
  }
}