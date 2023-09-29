import { Injectable } from '@angular/core';
import { RacunVrstica } from '../models/line-item.model';
import { BehaviorSubject, Observable, catchError, map, switchMap, take, tap, toArray } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { InvoicesService } from './invoices.service';
import { Artikel } from '../models/artikel.model';

@Injectable({
  providedIn: 'root'
})
export class LineItemService {
  private lineItemsSubject = new BehaviorSubject<RacunVrstica[]>([]);
  lineItems$ = this.lineItemsSubject.asObservable();
  private apiUrl = 'http://localhost:5102/api/LineItem';
  totalCost = 0;
  lineItemsLength$ = this.lineItems$.pipe(
    map((lineItems) => lineItems.length)
  );

  constructor(private http: HttpClient,
    private invoiceService: InvoicesService) { }

  setLineItemsToEmpty(){
    this.lineItemsSubject.next([]);
  }
  addLineItem(lineItem: RacunVrstica) {
    this.lineItemsLength$.pipe(take(1)).subscribe((length) => {
      lineItem.id = length + 1;
      this.setLineItems([...this.lineItemsSubject.value, lineItem]);
    });
  }
  updateLineItemNewInvoice(lineItem: RacunVrstica) {
    const currentTasks = this.lineItemsSubject.value;
    const updatedItems = currentTasks.map((item) => (item.id === lineItem.id ? lineItem : item));
    this.setLineItems(updatedItems);
}
    
  setLineItems(lineItems: RacunVrstica[]) {
    this.lineItemsSubject.next(lineItems);
  }
  
  getLineItemsArray(): RacunVrstica[] {
    return this.lineItemsSubject.getValue();
  }

  createLineItem(lineItem: RacunVrstica): Observable<RacunVrstica> {
    const headers = { 'Authorization': 'Bearer my-token', 'My-Custom-Header': 'foobar' };
    let lineItemToAdd = lineItem;
    if (!lineItemToAdd.invoiceId) {
      this.addLineItem(lineItemToAdd); // Add it to the unsaved list
      return new Observable<RacunVrstica>((observer) => {
        observer.next(lineItemToAdd); // Return the line item immediately
        observer.complete();
      });
    }
    return this.http.post<RacunVrstica>(this.apiUrl, lineItem, { headers }).pipe(
      catchError((error) => {
        console.error('Create Error:', error);
        throw error; 
      }),
      tap((newRacunVrstica) => {
        const currentItems = this.lineItemsSubject.value;
        currentItems.push(newRacunVrstica);
        this.setLineItems(currentItems); 
        const invoiceId = newRacunVrstica.invoiceId;
        const racunObservable = this.invoiceService.findInvoiceById(invoiceId);
        racunObservable.subscribe(async (racun) => {
          if (racun) {
            this.invoiceService.updateInvoice(racun);
          }
        });
      })
    );
  } 

  updateLineItem(lineItem: RacunVrstica): Observable<RacunVrstica> {
    const url = `${this.apiUrl}/${lineItem.id}`;
    return this.http.put<RacunVrstica>(url, lineItem).pipe(
      catchError((error) => {
        console.error('Edit Error:', error);
        throw error;
      }),
      tap(() => {
        const currentTasks = this.lineItemsSubject.value;
        const updatedItems = currentTasks.map((item) => (item.id === lineItem.id ? lineItem : item));
        this.setLineItems(updatedItems);
        const invoiceId = lineItem.invoiceId;
        const racunObservable = this.invoiceService.findInvoiceById(invoiceId);
        racunObservable.subscribe(async (racun) => {
          if (racun) {
            this.invoiceService.updateInvoice(racun); // You need to implement this method
          }
        });
      })
      )
  }

  findLineItemById(lineItemId: number): Observable<RacunVrstica | undefined> {
    return this.lineItems$.pipe(
      map((tasks) => tasks.find((task) => task.id === lineItemId))
    );
  }

  addNewLineItem(lineItem: RacunVrstica){
    const currentTasks = this.lineItemsSubject.value;
    currentTasks.push(lineItem);
    this.lineItemsSubject.next(currentTasks);
  }
  GetRacunLineItemById(invoiceId: number): void  {
    const url = `http://localhost:5102/api/Invoice/${invoiceId}/LineItem`;
    this.http.get<RacunVrstica[]>(url).pipe(
      catchError((error) => {
        console.error('Get All Tasks Error:', error);
        throw error; 
      })
    )
    .subscribe((lineItems) => {

      this.lineItemsSubject.next(lineItems);
    });
  }

  createLineItems(lineItems: RacunVrstica[]): Observable<RacunVrstica[]> {
    return this.http.post<RacunVrstica[]>(`${this.apiUrl}/Multiple`, lineItems);
  }
}