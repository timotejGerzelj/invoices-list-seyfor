import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError } from 'rxjs';
import { Racun } from '../models/racun.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class InvoicesService {
  private apiUrl = 'http://localhost:5102/api/Racun';
  private invoicesSubject = new BehaviorSubject<Racun[]>([]);
  invoices$ = this.invoicesSubject.asObservable();


  constructor(private http: HttpClient) { }
  getAllInvoices(): void {
    this.http.get<Racun[]>(this.apiUrl)
      .pipe(
        catchError((error) => {
          console.error('Get All Tasks Error:', error);
          throw error; 
        })
      )
      .subscribe((invoices) => {
        console.log(invoices)
        this.invoicesSubject.next(invoices);
      });
  }

  
}
