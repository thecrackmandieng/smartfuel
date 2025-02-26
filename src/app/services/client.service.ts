import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = 'http://localhost:5000/api'; // Correction de l’URL

  private baseUrl = "http://localhost:5000/api";

  constructor(private http: HttpClient) { }

  // Fonction pour ajouter un utilisateur
  addUser(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, userData);
  }

  // Fonction pour récupérer la liste des utilisateurs
  getUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/`);
  }

  addarchive(userId: string): Observable<any>{
    return this.http.put(`${this.baseUrl}/${userId}/archive`, {});
  }

   // Fonction pour désarchiver un utilisateur
   desarchive(userId: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${userId}/desarchive`, {});
  }

  // Modifier un utilisateur
  editUser(userId: string, userData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/user/${userId}`, userData);
}

 // Supprimer un utilisateur
 deleteUser(userId: string): Observable<any> {
  return this.http.delete(`${this.baseUrl}/${userId}`);
}

 // Blocage multiple des utilisateurs
 bloquerMultiple(userIds: string[]): Observable<any> {
  return this.http.put(`${this.baseUrl}/bloquer-multiple`, { userIds });
}

// Suppression multiple des utilisateurs
deleteMultipleUsers(userIds: string[]): Observable<any> {
  // Envoyer un objet avec une clé 'ids' qui contient le tableau d'IDs
  return this.http.delete(`${this.baseUrl}/delete-multiple`, { body: { ids: userIds } });
}
 
}