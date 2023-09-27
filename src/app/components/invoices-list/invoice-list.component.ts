import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, debounceTime, distinctUntilChanged, map, of, switchMap } from 'rxjs';
import { Racun } from 'src/app/models/racun.model';
import { Stranka } from 'src/app/models/stranka.model';
import { ArtikelService } from 'src/app/services/artikel.service';
import { InvoicesService } from 'src/app/services/invoices.service';
import { LineItemService } from 'src/app/services/line-item.service';
import { StrankaService } from 'src/app/services/stranka.service';

@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.css']
})
export class InvoiceListComponent {
  filterByCustomerSearch: string = '';
  customers: Stranka[] = []; // Replace 'Customer' with your actual customer type
  private searchTerms = new Subject<string>();
  invoices$: Observable<Racun[]>;
  filterByCustomer: number | undefined;
  fromDate: Date | null = null; // Filter by invoice date range
  toDate: Date | null = null;
  sortField: string | null = null; // Field to sort by
  sortDirection: 'asc' | 'desc' | null = null;
  searchByCustomers$ = new BehaviorSubject<string>('');
/*              <input
  id="customerFilter"
  class="form-control"
  type="text"
  [(ngModel)]="filterByCustomerSearch"
  [ngbTypeahead]="searchCustomers"
  [inputFormatter]="formatter"

  /> */

  constructor(
    private invoiceService: InvoicesService,
    private artikelService: ArtikelService,
    private strankaService: StrankaService,
    private lineItemService: LineItemService,
    private router: Router,
    ) {
  
      this.searchTerms
      .pipe(
        debounceTime(300), // Wait for 300ms pause in events
        distinctUntilChanged(), // Ignore if the search term hasn't changed
        switchMap((term: string) => this.searchCustomers(term)) // Switch to new observable each time the term changes
      )
      .subscribe((customers: Stranka[]) => {
        this.customers = customers;
      });

    }

    ngOnInit(): void {
      this.invoiceService.getAllInvoices();
      this.invoices$ = this.invoiceService.invoices$;
      this.artikelService.getAllArtikli();
      this.strankaService.getAllStranke().subscribe((stranke) => {
        console.log(stranke);
        this.customers = stranke;
        console.log(this.customers);
      });
      this.customers = this.strankaService.stranke;
      this.lineItemService.setLineItemsToEmpty()
    }
    search(term: string): void {
      this.searchTerms.next(term);
    }
    searchCustomers(term: string): Observable<Stranka[]> {
      const filteredCustomers = this.customers.filter(customer =>
        customer.ime.toLowerCase().includes(term.toLowerCase())
      );
  
      // Return the filtered results as an observable
      return of(filteredCustomers);
      }
  
    // Formatter function for the input field (to display the selected customer's name)
    formatter = (customer: Stranka) => customer.ime;

  

    applyFilters(): void {
      // Filter invoices based on criteria
      this.invoices$ = this.invoices$.pipe(
        map((invoices) => {
          return invoices
            .filter((invoice) => {
              // Apply customer filter
              if (this.filterByCustomer !== undefined) {
                if (invoice.strankaId != this.filterByCustomer) {
                  console.log("this.filterByCustomer, ", this.filterByCustomer);

                  return false;
                }
              }
    
              // Apply date range filter
              if (this.fromDate && this.toDate) {
                const fromDate = new Date(this.fromDate);
                const toDate = new Date(this.toDate);
                const invoiceDate = new Date(invoice.dateOfCreation);
                console.log('fromDate, ', fromDate);
                console.log('toDate, ', toDate);
                console.log('invoiceDate, ', invoiceDate);

                // Check if invoiceDate is within the date range
                if (invoiceDate.getTime() < fromDate.getTime() || invoiceDate.getTime() > toDate.getTime()) {
                  return false;
                }
              }
              console.log("hello");
              return true; // Invoice passes all filters
            });
        })
      );
      console.log(this.invoices$);
    }  
    clearFilters(): void {
      // Reset to original invoices
      this.invoices$ = this.invoiceService.invoices$;;
      // Reset filter criteria
      this.filterByCustomer = undefined;
      this.fromDate = null;
      this.toDate = null;
    }
    
  
    navigateToAddLineRow(invoiceId: number, lineItemId?: number) {
      if (lineItemId) {
        console.log("Hello")
        // Editing an existing lineItem
        this.router.navigate(['invoiceform', invoiceId, lineItemId]);
      } else {
        // Creating a new lineItem
        this.router.navigate(['invoiceform', invoiceId, 'new']);
      }
    }
    onNavigateToNewInvoice() {
      this.router.navigate(['/invoiceform/newinvoice']);
    }
    
}