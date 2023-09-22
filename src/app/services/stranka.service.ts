import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Stranka } from '../models/stranka.model';
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StrankaService {
  private apiUrl = 'http://localhost:5102/api/Stranka'
  stranke: Stranka[];

  constructor(private http: HttpClient) { }
  getAllStranke(): void {
    this.http.get<Stranka[]>(this.apiUrl)
      .pipe(
        catchError((error) => {
          console.error('Get All Tasks Error:', error);
          throw error; 
        })
      )
      .subscribe((artikli) => {
        console.log(artikli)
        this.stranke = artikli;
        console.log(this.stranke);
      });
  }

}
