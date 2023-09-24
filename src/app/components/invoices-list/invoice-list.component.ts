import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { Racun } from 'src/app/models/racun.model';
import { ArtikelService } from 'src/app/services/artikel.service';
import { InvoicesService } from 'src/app/services/invoices.service';
import { StrankaService } from 'src/app/services/stranka.service';

@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.css']
})
export class InvoiceListComponent {
  invoices$: Observable<Racun[]>;
  filterByCustomer: number | undefined;
  fromDate: Date | null = null; // Filter by invoice date range
  toDate: Date | null = null;
  sortField: string | null = null; // Field to sort by
  sortDirection: 'asc' | 'desc' | null = null;
  customers: any[] = []; 
  constructor(
    private invoiceService: InvoicesService,
    private artikelService: ArtikelService,
    private strankaService: StrankaService,
    private router: Router,
    ) {}

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
    }
    getAllInvoices() {
      // Define your filter and sort criteria based on this.filterCustomer, this.fromDate, this.toDate, this.sortField, and this.sortDirection
      const filters = {
        customer: this.filterByCustomer,
        fromDate: this.fromDate,
        toDate: this.toDate,
        sortField: this.sortField,
        sortDirection: this.sortDirection
      };
  
    }
    applyFilters(): void {
      // Filter invoices based on criteria
      console.log(this.filterByCustomer)
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
        // Editing an existing lineItem
        this.router.navigate(['invoiceform', invoiceId, lineItemId]);
      } else {
        // Creating a new lineItem
        this.router.navigate(['invoiceform', invoiceId, 'new']);
      }
    }
    
}
