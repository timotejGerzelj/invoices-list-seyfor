import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Racun } from 'src/app/models/racun.model';
import { InvoicesService } from 'src/app/services/invoices.service';

@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.css']
})
export class InvoiceListComponent {
  invoices$: Observable<Racun[]>;
  constructor(
    private invoiceService: InvoicesService) {}

    ngOnInit(): void {
      this.invoiceService.getAllInvoices();
      this.invoices$ = this.invoiceService.invoices$;

    }
}
