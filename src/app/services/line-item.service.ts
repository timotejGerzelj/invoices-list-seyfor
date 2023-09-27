import { Injectable } from '@angular/core';
import { RacunVrstica } from '../models/line-item.model';
import { BehaviorSubject, Observable, catchError, map, switchMap, take, tap, toArray } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { InvoicesService } from './invoices.service';

@Injectable({
  providedIn: 'root'
})
export class LineItemService {
  private lineItemsSubject = new BehaviorSubject<RacunVrstica[]>([]);
  lineItems$ = this.lineItemsSubject.asObservable();
  private apiUrl = 'http://localhost:5102/api/RacunVrstica';
  
  lineItemsLength$ = this.lineItems$.pipe(
    map((lineItems) => lineItems.length)
  );

  constructor(private http: HttpClient,
    private invoiceService: InvoicesService) { }

  setLineItemsToEmpty(){
    console.log("Emptying")
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
    console.log('New line items:', lineItems);
    this.lineItemsSubject.next(lineItems);
  }
  
  getLineItemsArray(): RacunVrstica[] {
    return this.lineItemsSubject.getValue();
  }


  createLineItem(lineItem: RacunVrstica): Observable<RacunVrstica> {
    const headers = { 'Authorization': 'Bearer my-token', 'My-Custom-Header': 'foobar' };
    let lineItemToAdd = lineItem;
    if (!lineItemToAdd.racunId) {
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
        newRacunVrstica.artikel = lineItemToAdd.artikel;
        const currentItems = this.lineItemsSubject.value;
        currentItems.push(newRacunVrstica);
        this.setLineItems(currentItems); 
        const racunId = newRacunVrstica.racunId;
        const racunObservable = this.invoiceService.findInvoiceById(racunId);
        racunObservable.subscribe(async (racun) => {
          if (racun) {
            console.log("Updating ", racun)
            const totalCost = this.calculateTotalCost();
            racun.znesek = totalCost;
            this.invoiceService.updateInvoice(racun);
          }
        });
      })
    );
  } 

  updateLineItem(lineItem: RacunVrstica): Observable<RacunVrstica> {
    const url = `${this.apiUrl}/${lineItem.id}`;
    console.log("Hello?, ", lineItem);
    return this.http.put<RacunVrstica>(url, lineItem).pipe(
      catchError((error) => {
        console.error('Edit Error:', error);
        throw error;
      }),
      tap((newLineitem) => {
        const currentTasks = this.lineItemsSubject.value;
        const updatedItems = currentTasks.map((item) => (item.id === lineItem.id ? lineItem : item));
        this.setLineItems(updatedItems);
        console.log("Updating ", newLineitem)
        const racunId = lineItem.racunId;
        const racunObservable = this.invoiceService.findInvoiceById(racunId);
        racunObservable.subscribe(async (racun) => {
          if (racun) {
            console.log("Updating ", racun)
            const totalCost = this.calculateTotalCost();
            racun.znesek = totalCost;
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
  GetRacunLineItemById(racunId: number): void  {
    const url = `http://localhost:5102/api/Racun/${racunId}/RacunVrstica`;
    this.http.get<RacunVrstica[]>(url).pipe(
      catchError((error) => {
        console.error('Get All Tasks Error:', error);
        throw error; 
      })
    )
    .subscribe((lineItems) => {

      console.log("lineItems, ", lineItems)
      this.lineItemsSubject.next(lineItems);
    });
  }
  calculateTotalCost(): number {
    let totalCost = 0;

    this.lineItems$.subscribe((lineItems) => {
      for (const lineItem of lineItems) {
        totalCost += lineItem.kolicina * (lineItem.artikel?.cena || 0);
      }
    });
    return totalCost;  
  }

  createLineItems(lineItems: RacunVrstica[]): Observable<RacunVrstica[]> {
    console.log("all line items, ", lineItems);
    return this.http.post<RacunVrstica[]>(`${this.apiUrl}/Multiple`, lineItems);
  }
}