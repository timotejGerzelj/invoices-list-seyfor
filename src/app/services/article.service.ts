import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map } from 'rxjs';
import { Artikel } from '../models/artikel.model';

@Injectable({
  providedIn: 'root'
})
export class ArtikelService {
  private apiUrl = 'http://localhost:5102/api/Article'
  constructor(private http: HttpClient) { }

  private artikelSubject = new BehaviorSubject<Artikel[]>([]);
  artikli: Artikel[] = [];
  getAllArtikli(): void {
    if (this.artikli.length === 0){

    
    this.http.get<Artikel[]>(this.apiUrl)
      .pipe(
        catchError((error) => {
          console.error('Get All Tasks Error:', error);
          throw error; 
        })
      )
      .subscribe((artikli) => {
        this.artikli = artikli;
        this.artikelSubject.next(artikli);
      });
    }
  }

}
