import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Pompe {
  _id?: string;
  type: string;
  capacite?: number;
  prix: number;
  systemePaiement?: string;
  numeroSerie?: string;
  status: string;
  selected?: boolean;
  typeCarburant: string; // Ajout de la propriété typeCarburant
}

@Injectable({
  providedIn: 'root'
})
export class PompeService {

  private apiUrl = 'http://localhost:5000/api/pompes'; // Remplacez par l'URL réelle de votre API

  constructor(private http: HttpClient) {}

  // Récupérer toutes les pompes
  getPompes(): Observable<Pompe[]> {
    return this.http.get<Pompe[]>(`${this.apiUrl}/listes`);
  }

  // Ajouter une nouvelle pompe
  addPompe(pompe: Pompe): Observable<any> {
    return this.http.post(`${this.apiUrl}`, pompe);
  }

  // Mettre à jour une pompe existante
  updatePompe(pompe: Pompe): Observable<any> {
    return this.http.put(`${this.apiUrl}/${pompe._id}`, pompe);
  }

  // Supprimer une pompe
  deletePompe(pompeId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${pompeId}`);
  }

  // Supprimer plusieurs pompes
  deletePompes(pompeIds: string[]): Observable<any> {
    const idsParam = pompeIds.join(','); // Convertir le tableau en string séparée par des virgules
    return this.http.delete(`${this.apiUrl}/delete-multiple?ids=${idsParam}`);
  }
  

  // Bloquer une pompe
bloquerPompe(pompeId: string): Observable<any> {
  return this.http.put(`${this.apiUrl}/bloquer/${pompeId}`, {});
}

}
