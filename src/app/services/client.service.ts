import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Stranka } from '../models/stranka.model';
import { Observable, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StrankaService {
  private apiUrl = 'http://localhost:5102/api/Client'
  stranke: Stranka[] = [];

  constructor(private http: HttpClient) { }
  getAllStranke(): Observable<Stranka[]> {
    if (this.stranke.length > 0) {
      return of(this.stranke);
    }
    

    return this.http.get<Stranka[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('Get All Client Error:', error);
        throw error; 
      })
    );
  
  }
  
  

}
