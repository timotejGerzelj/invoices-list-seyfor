import { Component, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Artikel } from 'src/app/models/artikel.model';
import { RacunVrstica } from 'src/app/models/line-item.model';
import { Racun } from 'src/app/models/racun.model';
import { Stranka } from 'src/app/models/stranka.model';
import { ArtikelService } from 'src/app/services/artikel.service';
import { InvoicesService } from 'src/app/services/invoices.service';
import { LineItemService } from 'src/app/services/line-item.service';
import { StrankaService } from 'src/app/services/stranka.service';

@Component({
  selector: 'app-invoice-form',
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.css']
})
export class InvoiceFormComponent {
  invoice: Racun;
  artikli: Artikel[];
  stranke: Stranka[];
  onSubmit = new EventEmitter<Racun>()
  isDisabled: boolean = false;
  invoiceForm: FormGroup;
  isPopupVisible: boolean = false;
  selectedLineItems: RacunVrstica[] = [];
  lineItems$: Observable<RacunVrstica[]>;
  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoicesService,
    private artikelService: ArtikelService,
    private route: ActivatedRoute,
    private router: Router,
    private strankaService: StrankaService,
    private lineItemService: LineItemService
  ) {}

  ngOnInit(): void {
    this.invoiceForm = this.fb.group({
      strankaId: [0, [Validators.required]],
      dateOfCreation: [null, [Validators.required]]
    });
    let lineItems: RacunVrstica[] = []
    this.route.params.subscribe((params) => {
      const invoiceId = +params['id'];
      this.stranke = this.strankaService.stranke;

      if (invoiceId) {
        this.invoiceService.findInvoiceById(invoiceId).subscribe((invoice) => {
        this.artikli = this.artikelService.artikli;
        if (invoice) {
            this.invoice = invoice;
            invoice.lineItems.forEach((lineItem) => {
            console.log(lineItem);
            lineItems.push(lineItem);
            const matchingArtikel = this.artikli.find((artikel) => artikel.id === lineItem.artikelId);
            if (matchingArtikel) {
              lineItem.artikel = matchingArtikel;
            }
          });
          const invoiceDate = new Date(invoice.dateOfCreation);
          const formattedDate = `${invoiceDate.getFullYear()}-${(invoiceDate.getMonth() + 1)
            .toString()
            .padStart(2, '0')}-${invoiceDate.getDate().toString().padStart(2, '0')}`;    
          this.invoiceForm.setValue({
            strankaId: invoice.strankaId,
            dateOfCreation: formattedDate
          })
          invoice.lineItems.forEach((lineItem) => {
            const matchingArtikel = this.artikli.find((artikel) => artikel.id === lineItem.artikelId);
            if (matchingArtikel) {
              lineItem.artikel = matchingArtikel;
            }
          });
         }
          else {
            this.initializeNewTask();
          }
      });
      }
      else {
      this.initializeNewTask();
    }
    console.log("Hello sneaky");
    this.lineItemService.setLineItems(lineItems);
    
    this.lineItems$ = this.lineItemService.lineItems$;

    });
}
calculateTheSum() {
    return 1;
}
onTaskSubmit(): void {
    if (this.invoiceForm.valid) {
      const strankaId = this.invoiceForm.get('strankaId')?.value;
      const dateOfCreation = this.invoiceForm.get('dateOfCreation')?.value;
      let lineItems = this.lineItemService.getLineItemsArray();

      const newInvoice: Racun = {
        id: 0 ,
        dateOfCreation: dateOfCreation,
        znesek: this.calculateTheSum(),
        orgId: 0,
        strankaId: strankaId,
        lineItems: lineItems
      };
  
    }
  }
  initializeNewTask(): void {
    this.invoice = {
      id: -1,
      dateOfCreation: new Date(),
      znesek: 0,
      orgId: 0,
      strankaId: 0,
      lineItems: []
    };
  }
  navigateToAddLineRow(invoiceId: number, lineItemId?: number) {
    this.invoiceService.selectedLineItems = this.selectedLineItems
    if (lineItemId) {
      // Editing an existing lineItem
      this.router.navigate(['invoiceform', invoiceId, lineItemId]);
    } else {
      // Creating a new lineItem
      this.router.navigate(['invoiceform', invoiceId, 'new']);
    }
  }
  
}
