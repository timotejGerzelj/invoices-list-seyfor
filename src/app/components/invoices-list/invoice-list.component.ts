import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
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
      this.strankaService.getAllStranke();
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
