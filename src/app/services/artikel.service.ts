import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map } from 'rxjs';
import { Artikel } from '../models/artikel.model';

@Injectable({
  providedIn: 'root'
})
export class ArtikelService {
  private apiUrl = 'http://localhost:5102/api/Artikel'
  constructor(private http: HttpClient) { }

  private artikelSubject = new BehaviorSubject<Artikel[]>([]);
  artikli$ = this.artikelSubject.asObservable();
  artikli: Artikel[];
  getAllArtikli(): void {
    this.http.get<Artikel[]>(this.apiUrl)
      .pipe(
        catchError((error) => {
          console.error('Get All Tasks Error:', error);
          throw error; 
        })
      )
      .subscribe((artikli) => {
        console.log(artikli)
        this.artikli = artikli;
        this.artikelSubject.next(artikli);
        console.log(this.artikli$);
      });
  }
    // Finds a task by its ID in the observable tasks$.
    findArtikelById(artikelId: number): Observable<Artikel | undefined> {
      console.log("invoiceId")
      return this.artikli$.pipe(
        map((artikli) => artikli.find((artikel) => artikel.id === artikelId))
      );
    }


}
