import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Client {
  _id?: string;
  codeCarte?: string;
  prenom: string;
  nom: string;
  telephone: string;
  email: string;
  role: string;
  carburant: string;
  status: string;
  solde: number;
  selected?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private apiUrl = 'http://localhost:5000/api'; // URL de l'API backend

  constructor(private http: HttpClient) {}

  
  // Récupérer tous les clients
  getClients(): Observable<Client[]> {
     return this.http.get<Client[]>(`${this.apiUrl}`);
   }
 

  // Ajouter un nouveau client
  addClient(client: Client): Observable<any> {
    return this.http.post(`${this.apiUrl}`, client);
  }

  // Mettre à jour un client existant
  updateClient(clientId: string, clientData: Partial<Client>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${clientId}`, clientData);
  }

  // Supprimer un client
  deleteClient(clientId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${clientId}`);
  }

  // Supprimer plusieurs clients
  deleteClients(clientIds: string[]): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-multiple`, { body: { clientIds } });
  }
}