import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, filter, map, tap } from 'rxjs';
import { Racun } from '../models/racun.model';
import { HttpClient } from '@angular/common/http';
import { RacunVrstica } from '../models/line-item.model';

@Injectable({
  providedIn: 'root'
})
export class InvoicesService {
  private apiUrl = 'http://localhost:5102/api/Invoice';
  private invoicesSubject = new BehaviorSubject<Racun[]>([]);
  invoices$ = this.invoicesSubject.asObservable();
  selectedLineItems: RacunVrstica[]
  setNewLineItems(newLineItems: RacunVrstica[]) {
    this.selectedLineItems = newLineItems;
  }
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
        this.invoicesSubject.next(invoices);
      });
  }

  // Finds a task by its ID in the observable tasks$.
  findInvoiceById(invoiceId: number): Observable<Racun | undefined> {
    return this.invoices$.pipe(
      map((invoices) => invoices.find((invoice) => invoice.id === invoiceId))
    );
  }

  createInvoice(invoice: Racun): Observable<Racun> {
    const headers = { 'Authorization': 'Bearer my-token', 'My-Custom-Header': 'foobar' };
    return this.http.post<Racun>(this.apiUrl, invoice, { headers }).pipe(
      catchError((error) => {
        console.error('Create Error:', error);
        throw error;
      }),
      tap((newTask) => {
        const currentTasks = this.invoicesSubject.value;
        currentTasks.push(newTask);
        this.invoicesSubject.next(currentTasks);
      })
    );
  }
  updateInvoice(updatedInvoice: Racun): Observable<Racun> {
    const url = `${this.apiUrl}/${updatedInvoice.id}`;
    return this.http.put<Racun>(url, updatedInvoice).pipe(
      catchError((error) => {
        console.error('Edit Error:', error);
        throw error;
      }),
      tap(() => {
        const currentInvoices = this.invoicesSubject.value;
        const updatedIndex = currentInvoices.findIndex((invoice) => invoice.id === updatedInvoice.id);
        if (updatedIndex !== -1) {
          currentInvoices[updatedIndex] = updatedInvoice;
          this.invoicesSubject.next([...currentInvoices]);
        }
      })
    );
  }
}
