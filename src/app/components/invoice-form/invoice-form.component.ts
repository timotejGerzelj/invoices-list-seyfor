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
  totalCost: number = 0;
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
    this.route.params.subscribe((params) => {
      const invoiceId = +params['id'];
      this.strankaService.getAllStranke().subscribe((stranke) => {
        console.log(stranke);
        this.stranke = stranke;
        console.log(this.stranke);
      });
      console.log(this.stranke)
      if (invoiceId) {
        this.invoiceService.findInvoiceById(invoiceId).subscribe((invoice) => {
        this.artikli = this.artikelService.artikli;
        if (invoice) {
          this.invoice = invoice;
          this.lineItemService.GetRacunLineItemById(invoiceId);
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

      });
      this.lineItems$ = this.lineItemService.lineItems$;
      }
      else {
      this.initializeNewInvoice();
    }    
    });
    this.calculateTotalCost();
}

initializeNewInvoice(): void {
  this.invoice = {
    id: 0 ,
    dateOfCreation: new Date().toISOString(),
    znesek: 0,
    orgId: 0,
    strankaId: 0,
    lineItems: []
  };}

onTaskSubmit(): void {
    if (this.invoiceForm.valid) {
      const strankaId = this.invoiceForm.get('strankaId')?.value;
      const dateOfCreation = this.invoiceForm.get('dateOfCreation')?.value;
      let lineItems = this.lineItemService.getLineItemsArray();

      const newInvoice: Racun = {
        id: 0 ,
        dateOfCreation: dateOfCreation,
        znesek: 0,
        orgId: 0,
        strankaId: strankaId,
        lineItems: lineItems
      };
  
    }
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
  navigateToRoot(): void {
    this.router.navigate(['/']);
  }

  onSubmitInvoiceForm() {
    console.log("Hello");
    console.log(this.invoice);
    if (this.invoice.id){
      this.invoice.dateOfCreation = this.invoiceForm.value.dateOfCreation;
        this.invoice.strankaId = this.invoiceForm.value.strankaId;
        this.invoiceService.updateInvoice(this.invoice).subscribe(
          (response) => {

            // Handle the response here
            console.log('Response:', response);
            this.navigateToRoot()
          },
          (error) => {
            // Handle errors here
            console.error('Error:', error);
          }
        );
      }
      else {
        this.invoice.dateOfCreation = this.invoiceForm.value.dateOfCreation;
        this.invoice.strankaId = this.invoiceForm.value.strankaId;
        this.invoice.orgId = 1;
        this.invoiceService.createInvoice(this.invoice).subscribe(
          (response) => {
            console.log('Response:', response);
            this.navigateToRoot()
          }, (error) => {
            console.error('Error:', error);

          }
        );
      }
  }
  calculateTotalCost(): void {
    let totalCost = 0;

    this.lineItems$.subscribe((lineItems) => {
      if (lineItems) {
        for (const lineItem of lineItems) {
          totalCost += lineItem.kolicina * (lineItem.artikel?.cena || 0);
        }
      }
      this.totalCost = totalCost;
    });
  }
}
