import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { Organisation } from '../models/organisation.model';

@Injectable({
  providedIn: 'root'
})
export class OrganisationService {
  private apiUrl = 'http://localhost:5102/api/Organisation'
  constructor(private http: HttpClient) { }
  organisations: Organisation[] = [];
  getAllOrganisations(): Observable<Organisation[]> {
    if (this.organisations.length > 0) {
      return of(this.organisations);
    }
    

    return this.http.get<Organisation[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('Get All Client Error:', error);
        throw error; 
      })
    );
  
  }


}
