import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { BehaviorSubject, Observable, map, of } from 'rxjs';
import { Organisation } from 'src/app/models/organisation.model';
import { Invoice } from 'src/app/models/invoice.model';
import { Client } from 'src/app/models/client.model';
import { ArticleService } from 'src/app/services/article.service';
import { InvoicesService } from 'src/app/services/invoices.service';
import { LineItemService } from 'src/app/services/line-item.service';
import { OrganisationService } from 'src/app/services/organisation.service';
import { ClientService } from 'src/app/services/client.service';
/* 
  Eden glavnih reci za katero sem se najvec odlocal je bilo ali naj klicem
  podatke loceno iz back-end ter jih tukaj sestavljam skupaj, ali naj jih veliko
  vecino dobim skupaj z Invoice modelom na katerega so vezani, zdelo se mi je bolj
  ustrezno, da jih locujem, da se jih lahko v prihodnosti uporablja za individualne 
  operacije, ce bi imel cas bi tudi implementiral paginacijo, ki bi za taksno nalogo bila idealna
*/
@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.css']
})
export class InvoiceListComponent {
  customers: Client[] = []; // Zamenjaj 'Stranka' z dejanskim tipom stranke
  organisations: Organisation[] = [];
  invoices$: Observable<Invoice[]>;
  filterByCustomer: number | undefined;
  fromDate: Date | null = null; // Filtriraj po obdobju datuma računa
  toDate: Date | null = null;
  sortField: string | null = null; // Polje za razvrščanje
  sortDirection: 'asc' | 'desc' | null = null;
  searchByCustomers$ = new BehaviorSubject<string>('');
  currentSortColumn: string = 'id';
  currentSortOrder: 'asc' | 'desc' = 'asc';
  filterForm: FormGroup;
  selectedCustomerId: number;
  selectedCustomerName: string = "";

  constructor(
    private invoiceService: InvoicesService,
    private articleService: ArticleService,
    private ClientService: ClientService,
    private lineItemService: LineItemService,
    private organisationService: OrganisationService,
    private router: Router,
    private fb: FormBuilder
  ) {
    // Inicializacija obrazca za filtriranje
    this.filterForm = this.fb.group({
      fromDate: [null, Validators.required],
      toDate: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    // Pridobitev vseh računov in drugih podatkov ob inicializaciji komponente
    this.invoiceService.getAllInvoices();
    this.invoices$ = this.invoiceService.invoices$;
    this.articleService.getAllArtikli();
    this.ClientService.getAllStranke().subscribe((stranke) => {
      this.customers = stranke;
      this.ClientService.stranke = stranke;
    });
    this.organisationService.getAllOrganisations().subscribe((organisations) => {
      this.organisations = organisations;
    });
    this.lineItemService.setLineItemsToEmpty();
  }

  // Iskanje strank po imenu
  searchCustomers(term: string): Observable<Client[]> {
    const filteredCustomers = this.customers.filter(customer =>
      customer.name.toLowerCase().includes(term.toLowerCase())
    );
    return of(filteredCustomers);
  }

  // Razvrščanje seznamov računov
  sortInvoices(column: string): void {
    if (this.currentSortColumn === column) {
      this.currentSortOrder = this.currentSortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSortColumn = column;
      this.currentSortOrder = 'asc'; // Privzeto naraščajoče razvrščanje ob spremembi stolpca.
    }
    this.invoices$ = this.sortInvoicesArray(this.invoices$);
  }

  // Funkcija za razvrščanje seznama računov
  private sortInvoicesArray(invoices$: Observable<Invoice[]>): Observable<Invoice[]> {
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
            compareResult = this.currentSortOrder === 'asc' ? this.customers[b.clientId - 1].name.localeCompare(this.customers[a.clientId - 1].name) : this.customers[a.clientId - 1].name.localeCompare(this.customers[b.clientId - 1].name);
          } else if (this.currentSortColumn === 'clientAddress') {
            compareResult = this.currentSortOrder === 'asc'  ? this.customers[a.clientId - 1].address.localeCompare( this.customers[b.clientId - 1].address) : this.customers[b.clientId - 1].address.localeCompare( this.customers[a.clientId - 1].address);
          }
          return compareResult;
        });
      })
    );

  }

  // Ob izbiri stranke iz iskalnega polja
  onCustomerSelect(event: TypeaheadMatch): void {
    this.selectedCustomerId = event.item.id;
    this.selectedCustomerName = event.item.name;
  }

  // Uporaba filtrov za prikaz računov
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

  // Počisti filtre in prikaži vse račune
  clearFilters(): void {
    this.invoices$ = this.invoiceService.invoices$;
    this.selectedCustomerId = 0;
    this.selectedCustomerName = "";
    this.fromDate = null;
    this.toDate = null;
  }

  // Preusmeritev na obrazec za urejanje računa
  navigateToAddLineRow(invoiceId: number, lineItemId?: number) {
    if (lineItemId) {
      this.router.navigate(['invoiceform', invoiceId, lineItemId]);
    } else {
      this.router.navigate(['invoiceform', invoiceId, 'new']);
    }
  }

  // Preusmeritev na obrazec za ustvarjanje novega računa
  onNavigateToNewInvoice() {
    this.router.navigate(['/invoiceform/newinvoice']);
  }
}