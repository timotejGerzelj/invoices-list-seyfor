import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Client } from '../models/client.model';
import { Observable, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = 'http://localhost:5102/api/Client'
  stranke: Client[] = [];

  constructor(private http: HttpClient) { }
  getAllStranke(): Observable<Client[]> {
    if (this.stranke.length > 0) {
      return of(this.stranke);
    }
    

    return this.http.get<Client[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('Get All Client Error:', error);
        throw error; 
      })
    );
  
  }
  
  

}
