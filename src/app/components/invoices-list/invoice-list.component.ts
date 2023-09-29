import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { BehaviorSubject, Observable, map, of } from 'rxjs';
import { Organisation } from 'src/app/models/organisation.model';
import { Racun } from 'src/app/models/racun.model';
import { Stranka } from 'src/app/models/stranka.model';
import { ArtikelService } from 'src/app/services/article.service';
import { InvoicesService } from 'src/app/services/invoices.service';
import { LineItemService } from 'src/app/services/line-item.service';
import { OrganisationService } from 'src/app/services/organisation.service';
import { StrankaService } from 'src/app/services/client.service';

@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.css']
})
export class InvoiceListComponent {
  customers: Stranka[] = []; // Replace 'Customer' with your actual customer type
  organisations: Organisation[] = [];
  invoices$: Observable<Racun[]>;
  filterByCustomer: number | undefined;
  fromDate: Date | null = null; // Filter by invoice date range
  toDate: Date | null = null;
  sortField: string | null = null; // Field to sort by
  sortDirection: 'asc' | 'desc' | null = null;
  searchByCustomers$ = new BehaviorSubject<string>('');
  currentSortColumn: string = 'id';
  currentSortOrder: 'asc' | 'desc' = 'asc';
  filterForm: FormGroup;
  selectedCustomerId: number;
  selectedCustomerName: string = "";

  constructor(
    private invoiceService: InvoicesService,
    private artikelService: ArtikelService,
    private strankaService: StrankaService,
    private lineItemService: LineItemService,
    private organisationService: OrganisationService,
    private router: Router,
    private fb: FormBuilder
    ) {
      this.filterForm = this.fb.group({
        fromDate: [null, Validators.required],
        toDate: [null, Validators.required],
      });
    }


    ngOnInit(): void {
      this.invoiceService.getAllInvoices();
      this.invoices$ = this.invoiceService.invoices$;
      this.artikelService.getAllArtikli();
      this.strankaService.getAllStranke().subscribe((stranke) => {
        this.customers = stranke;
        this.strankaService.stranke = stranke;
      });
      this.organisationService.getAllOrganisations().subscribe((organisations) =>
      {
        this.organisations = organisations;
      });
      this.lineItemService.setLineItemsToEmpty()
    }
    searchCustomers(term: string): Observable<Stranka[]> {
      const filteredCustomers = this.customers.filter(customer =>
        customer.name.toLowerCase().includes(term.toLowerCase())
      );
      return of(filteredCustomers);
      }

    sortInvoices(column: string): void {
      if (this.currentSortColumn === column) {
        this.currentSortOrder = this.currentSortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.currentSortColumn = column;
        this.currentSortOrder = 'asc'; // Default to ascending order when changing column.
      }
      this.invoices$ = this.sortInvoicesArray(this.invoices$);
    }
    
    private sortInvoicesArray(invoices$: Observable<Racun[]>): Observable<Racun[]> {
      return invoices$.pipe(
        map((invoices) => {
          return invoices.sort((a, b) => {
            let compareResult = 0;
            if (this.currentSortColumn === 'id') {
              compareResult = this.currentSortOrder === 'asc' ? a.id - b.id : b.id - a.id;
            } else if (this.currentSortColumn === 'dateOfCreation') {
              const dateA = new Date(a.dateOfCreation);
              const dateB = new Date(b.dateOfCreation);
              compareResult = this.currentSortOrder === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
            } else if (this.currentSortColumn === 'orgId') {
              compareResult = this.currentSortOrder === 'asc' ? a.orgId - b.orgId : b.orgId - a.orgId;
            } else if (this.currentSortColumn === 'organisation') {
              compareResult = this.organisations[a.orgId - 1].name.localeCompare(this.organisations[b.orgId - 1].name);
            } else if (this.currentSortColumn === 'price') {
              compareResult = this.currentSortOrder === 'asc' ? a.price - b.price : b.price - a.price;
            } else if (this.currentSortColumn === 'clientId') {
              compareResult = this.currentSortOrder === 'asc' ? a.clientId - b.clientId : b.clientId - a.clientId;
            } else if (this.currentSortColumn === 'clientName') {
              compareResult = this.customers[a.clientId - 1].name.localeCompare(this.customers[b.clientId - 1].name);
            } else if (this.currentSortColumn === 'clientAddress') {
              compareResult = this.customers[a.clientId - 1].address.localeCompare( this.customers[b.clientId - 1].address);
            } 
            return compareResult;
          });
        })
      );
    }
    onCustomerSelect(event: TypeaheadMatch): void {
      this.selectedCustomerId = event.item.id;
      this.selectedCustomerName = event.item.name;
    }  
    applyFilters(): void {
      this.invoices$ = this.invoices$.pipe(
        map((invoices) => {
          return invoices
            .filter((invoice) => {
              if (this.selectedCustomerId !== undefined) {
                if (invoice.clientId != this.selectedCustomerId) {
                  return false;
                }
              }
              if (this.fromDate && this.toDate) {
                const fromDate = new Date(this.fromDate);
                const toDate = new Date(this.toDate);
                const invoiceDate = new Date(invoice.dateOfCreation);

                if (invoiceDate.getTime() < fromDate.getTime() || invoiceDate.getTime() > toDate.getTime()) {
                  return false;
                }
              }
              return true; 
            });
        })
      );
    }  
    clearFilters(): void {
      this.invoices$ = this.invoiceService.invoices$;;
      this.selectedCustomerId = 0;
      this.selectedCustomerName = "";
      this.fromDate = null;
      this.toDate = null;
    }
    navigateToAddLineRow(invoiceId: number, lineItemId?: number) {
      if (lineItemId) {
        this.router.navigate(['invoiceform', invoiceId, lineItemId]);
      } else {
        this.router.navigate(['invoiceform', invoiceId, 'new']);
      }
    }
    onNavigateToNewInvoice() {
      this.router.navigate(['/invoiceform/newinvoice']);
    }
    
}