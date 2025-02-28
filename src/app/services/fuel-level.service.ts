import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FuelLevelService {
  private socket = io('http://localhost:5000'); // Assurez-vous que le backend tourne sur ce port

  constructor() {}

  getFuelLevels(): Observable<{ essence: number, gazole: number }> {
    return new Observable(observer => {
      this.socket.on('fuelUpdate', (data) => {
        observer.next(data);
      });

      return () => {
        this.socket.disconnect();
      };
    });
  }
}
