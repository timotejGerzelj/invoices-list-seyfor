import { Injectable } from '@angular/core';
import { LineItem } from '../models/line-item.model';
import { BehaviorSubject, Observable, catchError, map, switchMap, take, tap, toArray } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { InvoicesService } from './invoices.service';
/*
  Najvecja dilema se je zgodila tukaj ko sem poskusal pogruntati
  kako naj vnasam vrstice racuna v racun, ki se ne obstaja, po 
  kar nekaj poskusih, v razlicnih pristopih sem se odlocil, da
  bom vrstice racuna nadzoroval loceno od samega racuna z lineItems$,
  ki predstavlja vse vrstice ravnokar izbranega (obstojecega ali neobstojecega) racuna
*/
@Injectable({
  providedIn: 'root'
})
export class LineItemService {
  private lineItemsSubject = new BehaviorSubject<LineItem[]>([]);
  lineItems$ = this.lineItemsSubject.asObservable();
  private apiUrl = 'http://localhost:5102/api/LineItem';
  totalCost = 0;
  lineItemsLength$ = this.lineItems$.pipe(
    map((lineItems) => lineItems.length)
  );

  constructor(private http: HttpClient,
    private invoiceService: InvoicesService) { }

  // Nastavi postavke na računu na prazno
  setLineItemsToEmpty(){
    this.lineItemsSubject.next([]);
  }

  // Dodaj vrstico na račun
  addLineItem(lineItem: LineItem) {
    this.lineItemsLength$.pipe(take(1)).subscribe((length) => {
      lineItem.id = length + 1;
      this.setLineItems([...this.lineItemsSubject.value, lineItem]);
    });
  }

  // Posodobi vrstico na računu
  updateLineItemNewInvoice(lineItem: LineItem) {
    const currentItems = this.lineItemsSubject.value;
    const updatedItems = currentItems.map((item) => (item.id === lineItem.id ? lineItem : item));
    this.setLineItems(updatedItems);
  }

  // Nastavi postavke na računu
  setLineItems(lineItems: LineItem[]) {
    this.lineItemsSubject.next(lineItems);
  }
  
  // Vrni seznam postavk na računu kot polje
  getLineItemsArray(): LineItem[] {
    return this.lineItemsSubject.getValue();
  }

  // Ustvari novo vrstico na računu
  createLineItem(lineItem: LineItem): Observable<LineItem> {
    const headers = { 'Authorization': 'Bearer moj-žeton', 'Moj-prilagojeni-Header': 'foobar' };
    let lineItemToAdd = lineItem;
    if (!lineItemToAdd.invoiceId) {
      this.addLineItem(lineItemToAdd); // Dodaj v seznam neposodobljenih postavk
      return new Observable<LineItem>((observer) => {
        observer.next(lineItemToAdd); // Vrni vrstico takoj
        observer.complete();
      });
    }
    return this.http.post<LineItem>(this.apiUrl, lineItem, { headers }).pipe(
      catchError((error) => {
        console.error('Napaka pri ustvarjanju postavke:', error);
        throw error; 
      }),
      tap((newLineItem) => {
        const currentItems = this.lineItemsSubject.value;
        currentItems.push(newLineItem);
        this.setLineItems(currentItems); 
        const invoiceId = newLineItem.invoiceId;
        const racunObservable = this.invoiceService.findInvoiceById(invoiceId);
        racunObservable.subscribe(async (racun) => {
          if (racun) {
            this.invoiceService.updateInvoice(racun);
          }
        });
      })
    );
  } 

  // Posodobi vrstico na računu
  updateLineItem(lineItem: LineItem): Observable<LineItem> {
    const url = `${this.apiUrl}/${lineItem.id}`;
    return this.http.put<LineItem>(url, lineItem).pipe(
      catchError((error) => {
        console.error('Napaka pri urejanju postavke:', error);
        throw error;
      }),
      tap(() => {
        const currentItems = this.lineItemsSubject.value;
        const updatedItems = currentItems.map((item) => (item.id === lineItem.id ? lineItem : item));
        this.setLineItems(updatedItems);
        const invoiceId = lineItem.invoiceId;
        const racunObservable = this.invoiceService.findInvoiceById(invoiceId);
        racunObservable.subscribe(async (racun) => {
          if (racun) {
            this.invoiceService.updateInvoice(racun); // Potrebujete implementacijo te metode
          }
        });
      })
    );
  }

  // Poišči vrstico na računu po identifikacijskem znaku
  findLineItemById(lineItemId: number): Observable<LineItem | undefined> {
    return this.lineItems$.pipe(
      map((postavke) => postavke.find((postavka) => postavka.id === lineItemId))
    );
  }

  // Dodaj novo vrstico na računu
  addNewLineItem(lineItem: LineItem){
    const currentItems = this.lineItemsSubject.value;
    currentItems.push(lineItem);
    this.lineItemsSubject.next(currentItems);
  }

  // Pridobi postavke na računu glede na identifikacijski znak računa
  GetRacunLineItemById(invoiceId: number): void  {
    const url = `http://localhost:5102/api/Invoice/${invoiceId}/LineItem`;
    this.http.get<LineItem[]>(url).pipe(
      catchError((error) => {
        console.error('Napaka pri pridobivanju postavk:', error);
        throw error; 
      })
    )
    .subscribe((postavke) => {
      this.lineItemsSubject.next(postavke);
    });
  }

  // Ustvari več postavk na računu hkrati
  createLineItems(postavke: LineItem[]): Observable<LineItem[]> {
    return this.http.post<LineItem[]>(`${this.apiUrl}/Multiple`, postavke);
  }
}
