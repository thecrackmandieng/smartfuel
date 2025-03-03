import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AssignService {
  private socket!: WebSocket;
  private reconnectInterval = 3001;
  private isConnecting = false;
  private messages$: Subject<any> = new Subject();
  private errorSubject: Subject<string> = new Subject<string>();

  private apiUrl = 'http://localhost:8000/api/users';

  constructor(private http: HttpClient) {}

  connect(): void {
    if (this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    this.socket = new WebSocket('ws://localhost:3000');

    this.socket.onopen = () => {
      console.log('WebSocket connecté.');
      this.isConnecting = false;
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.messages$.next(message); // Diffuse le message reçu
      } catch (error) {
        console.error('❌ Erreur de parsing JSON:', error);
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket fermé. Tentative de reconnexion...');
      setTimeout(() => this.connect(), this.reconnectInterval);
    };

    this.socket.onerror = (error) => {
      console.error('❌ Erreur WebSocket:', error);
      this.errorSubject.next('Erreur WebSocket');
    };
  }

  // Méthode pour envoyer un message via WebSocket
  sendMessage(message: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
      console.log("📤 Message envoyé au WebSocket:", message);
    } else {
      console.error("❌ WebSocket non connecté, impossible d'envoyer le message !");
    }
  }
  listenForScan(): Observable<any> {
    return this.messages$.asObservable();
  }
  

  updateUid(userId: string, newUid: string): Observable<any> {
    const url = `http://localhost:5000/api/auth/${userId}/assigner-carte`;
    return this.http.put(url, { carteRfid: newUid }).pipe(
      catchError(error => {
        console.error('❌ Erreur lors de la mise à jour de l’UID:', error);
        throw error; // Propagation de l'erreur
      })
    );
  }
  
  

  // Getter pour l'Observable messages$
  get messages(): Observable<any> {
    return this.messages$.asObservable(); // Retourne l'Observable pour que l'abonnement soit possible
  }

  // Getter pour l'Observable errorSubject
  listenForErrors(): Observable<string> {
    return this.errorSubject.asObservable();
  }
}
