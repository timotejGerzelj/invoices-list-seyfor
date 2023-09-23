import { Injectable } from '@angular/core';
import { RacunVrstica } from '../models/line-item.model';
import { BehaviorSubject, Observable, catchError, map, tap } from 'rxjs';
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
        console.log("Hello");
        // When the POST request is successful, add the newTask to the existing tasks
        const currentTasks = this.lineItemsSubject.value;
        currentTasks.push(newRacunVrstica);
        this.lineItemsSubject.next(currentTasks);
      })
    );

  }
  updateLineItem(lineItem: RacunVrstica): Observable<RacunVrstica> {
    console.log(lineItem);
    const url = `${this.apiUrl}/${lineItem.id}`;
    return this.http.put<RacunVrstica>(url, lineItem).pipe(
      catchError((error) => {
        console.error('Edit Error:', error);
        throw error;
      }),
      tap(() => {
        const currentLineItems = this.lineItemsSubject.value;
        const updatedIndex = currentLineItems.findIndex((task) => task.id === lineItem.id);
        if (updatedIndex !== -1) {
          currentLineItems[updatedIndex] = lineItem;
          this.lineItemsSubject.next([...currentLineItems]);
        }
      })
    );
  }
  findLineItemById(lineItemId: number): Observable<RacunVrstica | undefined> {
    return this.lineItems$.pipe(
      map((tasks) => tasks.find((task) => task.id === lineItemId))
    );
  }


}
