import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Stranka } from '../models/stranka.model';
import { Observable, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StrankaService {
  private apiUrl = 'http://localhost:5102/api/Stranka'
  stranke: Stranka[];

  constructor(private http: HttpClient) { }
  getAllStranke(): Observable<Stranka[]> {
    return this.http.get<Stranka[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('Get All Tasks Error:', error);
        throw error; 
      })
    );
  }
  
  

}
