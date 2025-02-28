import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AssignService {
  private socket: WebSocket;
  private errorSubject: Subject<string> = new Subject<string>(); // Sujet pour émettre les erreursles messages reçus

  constructor() {
    this.socket = new WebSocket('ws://localhost:8081'); // Connexion WebSocket
    this.socket.onopen = () => {
      console.log('🟢 WebSocket connecté');
    };

    this.socket.onerror = (error) => {
      console.error('❌ Erreur WebSocket', error);
      this.errorSubject.next('Erreur WebSocket'); // Émettre l'erreur
    };

    this.socket.onclose = () => {
      console.log('🔴 WebSocket fermé');
    };

  }
  

   /**
   * Écoute les messages WebSocket et retourne un Observable avec les données utilisateur
   * @returns Observable contenant le nom et le rôle de l'utilisateur
   */
   listenForScan(): Observable<{ nom: string, role: string }> {
    return new Observable(observer => {
      this.socket.onmessage = (event) => {
        console.log('📩 Données reçues du WebSocket:', event.data);
        
        try {
          const data = JSON.parse(event.data);
          
          if (data.success && data.user) {
            observer.next({
              nom: data.user.nom,
              role: data.user.role
            });
          } else {
            observer.error('Utilisateur non trouvé');
          }
        } catch (error) {
          observer.error('❌ Erreur de parsing des données');
        }
      };

      this.socket.onerror = (error) => {
        observer.error('❌ Erreur WebSocket pour rfid');
      };

      this.socket.onclose = () => {
        observer.complete();
      };
    });
  }

  /**
   * Retourne un Observable qui écoute les erreurs WebSocket
   * @returns Observable<string> contenant les messages d'erreur
   */
  listenForErrors(): Observable<string> {
    return this.errorSubject.asObservable(); // Retourne l'Observable des erreurs
  }
}
