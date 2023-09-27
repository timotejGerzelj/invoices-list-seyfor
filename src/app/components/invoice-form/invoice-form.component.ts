import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, map, switchMap, take } from 'rxjs';
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
  isDisabled: boolean = false;
  invoiceForm: FormGroup;
  lineItemForm: FormGroup;
  selectedLineItems: RacunVrstica[] = [];
  lineItems$: Observable<RacunVrstica[]>;
  totalCost: number = 0;
  editedLineItemIndex: number = -1;
  lineItemEditForm: FormGroup;

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
    this.lineItemForm = this.fb.group({
      artikelId: [0, [Validators.required]], // Update form control name to "strankaId"
      quantity: [0, [Validators.required, Validators.min(1)]] // Update form control name to "quantity"
    });
    this.lineItemEditForm = this.fb.group({
      artikelIdEdit: [null, [Validators.required]],
      quantityEdit: [null, [Validators.required, Validators.min(1)]],
    });
    this.lineItemService.setLineItemsToEmpty();
    this.artikli = this.artikelService.artikli;
    console.log("artikli, ", this.artikli);
    this.route.params.subscribe((params) => {
      const invoiceId = +params['id'];
      console.log("invoiceId: ", invoiceId);

      this.strankaService.getAllStranke().subscribe((stranke) => {
        this.stranke = stranke;
      });
      this.artikli = this.artikelService.artikli;
      if (invoiceId) {
        this.invoiceService.findInvoiceById(invoiceId).subscribe((invoice) => {
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
          this.lineItems$ = this.lineItemService.lineItems$;
         }
         else {
          console.log("Invoice not found.");
         }

      })
      }
      else {
      this.lineItems$ = this.lineItemService.lineItems$;
      this.initializeNewInvoice();
    }    
    });
    this.lineItems$ = this.lineItemService.lineItems$;

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
  navigateToRoot(): void {
    this.lineItemService.setLineItemsToEmpty()
    this.router.navigate(['/']);
  }
  
  onSubmitInvoiceForm() {
    if (this.invoice.id != 0){
      this.invoice.dateOfCreation = this.invoiceForm.value.dateOfCreation;
        this.invoice.strankaId = parseInt(this.invoiceForm.value.strankaId);
        this.invoice.lineItems = [];
        this.invoice.znesek = this.totalCost;
        console.log(this.invoice);
        this.invoiceService.updateInvoice(this.invoice).subscribe(
          (response) => {
            console.log('Response:', response);
            this.navigateToRoot()
          },
          (error) => {
            console.error('Error:', error);
          }
        );
      }
      else {
        this.invoice.dateOfCreation = this.invoiceForm.value.dateOfCreation;
        this.invoice.strankaId = this.invoiceForm.value.strankaId;
        this.invoice.orgId = 1;
        this.invoice.znesek = this.totalCost;
        this.invoiceService.createInvoice(this.invoice).subscribe(
          (response) => {
            console.log('Response:', response);
            this.createLineItems(response.id)
          }, (error) => {
            console.error('Error:', error);
          }
        );
      }
  }
  setLineItem(invoiceId: number): RacunVrstica {
    const lineItem: RacunVrstica = {
      id: 0,
      artikelId: 0,
      racunId: invoiceId,
      kolicina: 0,
    };
    return lineItem;
    }
  onLineItemSubmit(){
    //create
    if (this.invoice.id != 0){
      let newRacunVrstica = this.setLineItem(this.invoice.id);
      newRacunVrstica.artikelId = parseInt(this.lineItemForm.value.artikelId);
      newRacunVrstica.kolicina = this.lineItemForm.value.quantity;
      newRacunVrstica.artikel = this.artikli.find((artikel) => artikel.id === newRacunVrstica.artikelId);
      console.log("Racun artikel: ", newRacunVrstica);

      this.lineItemService.createLineItem(newRacunVrstica).subscribe(
        (response) => {
          // Handle the response here
          console.log('Response:', response);
          this.isArtikelAlreadySelected(newRacunVrstica.artikelId)
        },
        (error) => {
          // Handle errors here
          console.error('Error:', error);
        }
      );
    }
    else {
      let newRacunVrstica = this.setLineItem(0);
      newRacunVrstica.artikelId = parseInt(this.lineItemForm.value.artikelId);
      newRacunVrstica.artikel = this.artikli.find((artikel) => artikel.id === newRacunVrstica.artikelId);
      newRacunVrstica.kolicina = this.lineItemForm.value.quantity;
      console.log("Racun artikel: ", newRacunVrstica);
      this.lineItemService.addLineItem(newRacunVrstica);
      this.isArtikelAlreadySelected(newRacunVrstica.artikelId)
    }
    this.lineItemForm.reset({
      artikelId: null, 
      quantity: null,   
    });
    this.lineItemForm.markAsUntouched();


    this.calculateTotalCost();
  }
  startEditingLineItem(index: number) {
    this.editedLineItemIndex = index;
    this.lineItems$.subscribe((lineItems) => {
      if (lineItems && lineItems.length > index) {
        const selectedLineItem = lineItems[index];
        console.log(selectedLineItem);
        this.lineItemEditForm.patchValue({
          artikelIdEdit: selectedLineItem.artikelId,
          quantityEdit: selectedLineItem.kolicina,
        });
      }
    });
  }
  saveEditedLineItem(lineItem: RacunVrstica) {
    if (this.invoice.id) {
      const updatedArtikelId = lineItem.artikelId;
      const updatedQuantity = lineItem.kolicina;
      lineItem.artikelId = updatedArtikelId;
      lineItem.kolicina = updatedQuantity;
      this.artikli.forEach((artikel) => {
        if (artikel.id === lineItem.artikelId) {
          lineItem.artikel = artikel;
        }
      });
      this.lineItemService.updateLineItem(lineItem).subscribe(
        (response) => {
          // Handle the response here
          console.log('Response:', response);
        },
        (error) => {
          // Handle errors here
          console.error('Error:', error);
        }
      );
    } else {
      const updatedArtikelId = lineItem.artikelId;
      const updatedQuantity = lineItem.kolicina;
      lineItem.artikelId = updatedArtikelId;
      lineItem.kolicina = updatedQuantity;
      this.artikli.forEach((artikel) => {
        if (artikel.id === lineItem.artikelId) {
          lineItem.artikel = artikel;
        }
      });
      this.lineItemService.updateLineItem(lineItem);
    }
    this.editedLineItemIndex = -1;
    this.calculateTotalCost();
  }
  // Function to cancel editing
  cancelEditingLineItem() {
    this.editedLineItemIndex = -1;
  }
  createLineItems(invoiceId: number) {
    this.lineItems$
      .pipe(
        take(1), 
        switchMap((lineItems) => {
          const modifiedLineItems = lineItems.map((lineItem) => ({
            ...lineItem,
            id: 0,
            artikel: undefined, // Or use delete lineItem.artikel; if needed
            racunId: invoiceId,
          }));
          return this.lineItemService.createLineItems(modifiedLineItems);
        })
      )
      .subscribe(
        (lineItemsResponse) => {
          console.log('Line items created/updated:', lineItemsResponse);
          this.navigateToRoot();
        },
        (error) => {
          console.error('Error:', error);
        }
      );
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
  isArtikelAlreadySelected(artikelId: number): boolean {
    let isSelected = false;
    this.lineItems$.subscribe((lineItems) => {
      if (lineItems) {
        isSelected = lineItems.some((lineItem) => lineItem.artikelId === artikelId);
      }
    });
    return isSelected;
  }
}