import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class FuelLevelService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:5000', {
      withCredentials: true
    });
  }

  getFuelLevels(): Observable<{ essence: number; gazole: number }> {
    return new Observable(observer => {
      this.socket.on('fuelUpdate', (data) => {
        observer.next(data);
      });
    });
  }
}
