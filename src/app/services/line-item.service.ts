import { Injectable } from '@angular/core';
import { RacunVrstica } from '../models/line-item.model';
import { BehaviorSubject, Observable, catchError, map, switchMap, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LineItemService {
  private lineItemsSubject = new BehaviorSubject<RacunVrstica[]>([]);
  lineItems$ = this.lineItemsSubject.asObservable();
  private apiUrl = 'http://localhost:5102/api/RacunVrstica';

  constructor(private http: HttpClient) { }
  addLineItem(lineItem: RacunVrstica) {
    console.log('New line item:', lineItem);

    const currentLineItems = this.lineItemsSubject.value;
    const updatedLineItems = [...currentLineItems, lineItem];
    console.log('New line items:', lineItem);
    this.setLineItems(updatedLineItems);
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
    console.log(lineItem);
    return this.http.post<RacunVrstica>(this.apiUrl, lineItem, { headers }).pipe(
      catchError((error) => {
        console.error('Create Error:', error);
        throw error; 
      }),
      tap((newRacunVrstica) => {
        // Update the lineItemsSubject with the newly created line item
        const currentItems = this.lineItemsSubject.value;
        currentItems.push(newRacunVrstica);
        this.setLineItems(currentItems); // Update the observable here
      })
    );
  } 
  updateLineItem(lineItem: RacunVrstica): Observable<RacunVrstica> {
    console.log("updating lineItem, ", lineItem);
    const url = `${this.apiUrl}/${lineItem.id}`;
    return this.http.put<RacunVrstica>(url, lineItem).pipe(
      catchError((error) => {
        console.error('Edit Error:', error);
        throw error;
      }),
      tap((newLineitem) => {
        // Update the lineItemsSubject with the newly created line item
        console.log("to update: ", lineItem);
        const currentTasks = this.lineItemsSubject.value;
        const updatedItems = currentTasks.map((item) => (item.id === lineItem.id ? lineItem : item));
        console.log("updatedItems");
        this.setLineItems(updatedItems); // Update the observable here
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




}
