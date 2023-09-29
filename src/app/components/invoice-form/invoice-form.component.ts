import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { Observable, filter, map, switchMap, take } from 'rxjs';
import { Artikel } from 'src/app/models/artikel.model';
import { RacunVrstica } from 'src/app/models/line-item.model';
import { Racun } from 'src/app/models/racun.model';
import { Stranka } from 'src/app/models/stranka.model';
import { ArtikelService } from 'src/app/services/article.service';
import { InvoicesService } from 'src/app/services/invoices.service';
import { LineItemService } from 'src/app/services/line-item.service';
import { StrankaService } from 'src/app/services/client.service';

@Component({
  selector: 'app-invoice-form',
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.css']
})
export class InvoiceFormComponent {
  invoice: Racun;
  artikli: Artikel[];
  customers: Stranka[];
  invoiceForm: FormGroup;
  lineItemForm: FormGroup;
  lineItems$: Observable<RacunVrstica[]>;
  totalCost: number = 0;
  editedLineItemIndex: number = -1;
  editedLineItem: RacunVrstica; // Add this property
  lineItemEditForm: FormGroup;
  selectedCustomerId: number;
  selectedCustomerName: string = "";

  todayDate: Date;
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
    this.todayDate = new Date();
    this.invoiceForm = this.fb.group({
      dateOfCreation: [null, [Validators.required, this.futureDateValidator()]]
    });
    this.lineItemForm = this.fb.group({
      articleId: [null, [Validators.required]], // Update form control name to "clientId"
      quantity: [null, [Validators.required, Validators.min(1)]] // Update form control name to "quantity"
    });
    this.lineItemEditForm = this.fb.group({
      artikelIdEdit: [null, [Validators.required]],
      quantityEdit: [0, [Validators.required, Validators.min(1)]],
    });
    this.lineItemService.setLineItemsToEmpty();
    this.artikli = this.artikelService.artikli;
    this.route.params.subscribe((params) => {
      const invoiceId = +params['id'];

      this.customers = this.strankaService.stranke;
      if (invoiceId) {
        this.invoiceService.findInvoiceById(invoiceId).subscribe((invoice) => {
        if (invoice) {
          this.invoice = invoice;
          this.lineItemService.GetRacunLineItemById(invoiceId);
          const invoiceDate = new Date(invoice.dateOfCreation);
          const formattedDate = `${invoiceDate.getFullYear()}-${(invoiceDate.getMonth() + 1)
            .toString()
            .padStart(2, '0')}-${invoiceDate.getDate().toString().padStart(2, '0')}`;    
            this.selectedCustomerId = invoice.clientId
            const foundArtikel = this.customers.find((customer) => customer.id === invoice.clientId);
            this.selectedCustomerName = foundArtikel?.name || ''; 
          this.invoiceForm.setValue({
            clientId: invoice.clientId,
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
    price: 0,
    orgId: 0,
    clientId: 0 
  };}
  navigateToRoot(): void {
    this.lineItemService.setLineItemsToEmpty()
    this.totalCost = 0
    this.router.navigate(['/']);
  }
  futureDateValidator() {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const selectedDate = new Date(control.value);
      const currentDate = new Date();
      if (selectedDate < currentDate) {
        return { futureDate: true };
      }
      return null;
    };
  }
onSubmitInvoiceForm() {
    if (this.invoice.id != 0){
      this.invoice.dateOfCreation = this.invoiceForm.value.dateOfCreation;
      this.invoice.clientId = this.selectedCustomerId;
        this.invoice.price = this.totalCost;
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
        this.invoice.clientId = this.selectedCustomerId;
        this.invoice.orgId = 1;
        this.invoice.price = this.totalCost;
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
      articleId: 0,
      invoiceId: invoiceId,
      quantity: 0,
    };
    return lineItem;
    }
  onLineItemSubmit(){
    //create
    if (this.invoice.id != 0){
      let newRacunVrstica = this.setLineItem(this.invoice.id);
      newRacunVrstica.articleId = parseInt(this.lineItemForm.value.articleId);
      newRacunVrstica.quantity = this.lineItemForm.value.quantity;

      this.lineItemService.createLineItem(newRacunVrstica).subscribe(
        (response) => {
          // Handle the response here
          console.log('Response:', response);
          this.isArtikelAlreadySelected(newRacunVrstica.articleId)
        },
        (error) => {
          // Handle errors here
          console.error('Error:', error);
        }
      );
    }
    else {
      let newRacunVrstica = this.setLineItem(0);
      newRacunVrstica.articleId = parseInt(this.lineItemForm.value.articleId);
      newRacunVrstica.quantity = this.lineItemForm.value.quantity;
      this.lineItemService.addLineItem(newRacunVrstica);
      this.isArtikelAlreadySelected(newRacunVrstica.articleId)
    }
    this.lineItemForm.reset({
      articleId: null, 
      quantity: null,   
    });
    this.lineItemForm.markAsUntouched();
    this.calculateTotalCost();
  }
  startEditingLineItem(index: number) {
    this.editedLineItemIndex = index;
    this.lineItems$.subscribe((lineItems) => {
      if (lineItems && lineItems.length > index) {
        this.editedLineItem = { ...lineItems[index] }; // Keep a copy of the original values
        this.lineItemEditForm.patchValue({
          artikelIdEdit: this.editedLineItem.articleId,
          quantityEdit: this.editedLineItem.quantity,
        });
      }
    });
  }
    saveEditedLineItem(lineItem: RacunVrstica) {
     if( !this.areLineItemsEqual(this.editedLineItem , lineItem)) {
      this.calculateTotalCost();
      if (this.invoice.id) {
        const updatedArtikelId = lineItem.articleId;
        const updatedQuantity = lineItem.quantity;
        lineItem.articleId = updatedArtikelId;
        lineItem.quantity = updatedQuantity;
        this.lineItemService.updateLineItem(lineItem).subscribe(
          (response) => {
          },
          (error) => {
            // Handle errors here
            console.error('Error:', error);
          }
        );
        console.log("this.totalCost updateLineItem ", this.totalCost)
        let invoicePrice = this.totalCost
        this.invoice.price = invoicePrice;
        
        this.invoiceService.updateInvoice(this.invoice).subscribe(
          (response) => {
            console.log('Response:', response);
            this.totalCost = invoicePrice;
          },
          (error) => {
            console.error('Error:', error);
          }
        );
      } else {
        const updatedArtikelId = lineItem.articleId;
        const updatedQuantity = lineItem.quantity;
        lineItem.articleId = updatedArtikelId;
        lineItem.quantity = updatedQuantity;
        console.log("this.totalCost updateLineItem ", this.totalCost)
        this.lineItemService.updateLineItem(lineItem);
      }
     }
    this.editedLineItemIndex = -1;
  }
  // Function to cancel editing
  areLineItemsEqual(lineItem1: RacunVrstica, lineItem2: RacunVrstica): boolean {
    return (
      lineItem1.articleId === lineItem2.articleId &&
      lineItem1.quantity === lineItem2.quantity
    );
  
    }
    createLineItems(invoiceId: number) {
    this.lineItems$
      .pipe(
        take(1), 
        switchMap((lineItems) => {
          const modifiedLineItems = lineItems.map((lineItem) => ({
            ...lineItem,
            id: 0,
            invoiceId: invoiceId,
          }));
          return this.lineItemService.createLineItems(modifiedLineItems);
        })
      )
      .subscribe(
        (lineItemsResponse) => {
          this.navigateToRoot();
        },
        (error) => {
          console.error('Error:', error);
        }
      );
  }
  calculateTotalCost(): void {
    this.lineItems$
      .pipe(
        filter((lineItems) => !!lineItems), // Filter out null or undefined
        map((lineItems) => {
          let totalCost = 0;
          for (const lineItem of lineItems) {
            totalCost += lineItem.quantity * (this.artikli[lineItem.articleId - 1]?.price || 0);
          }
          return totalCost;
        })
      )
      .subscribe((totalCost) => {
        this.totalCost = totalCost;
      });
  }
  
  isArtikelAlreadySelected(articleId: number): boolean {
    let isSelected = false;
    this.lineItems$.subscribe((lineItems) => {
      if (lineItems) {
        isSelected = lineItems.some((lineItem) => lineItem.articleId === articleId);
      }
    });
    return isSelected;
  }
  onCustomerSelect(event: TypeaheadMatch): void {
    this.selectedCustomerId = event.item.id;
    this.selectedCustomerName = event.item.name;
  } 
}