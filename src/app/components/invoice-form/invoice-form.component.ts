import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { Observable, filter, map, switchMap, take } from 'rxjs';
import { Article } from 'src/app/models/article.model';
import { LineItem } from 'src/app/models/line-item.model';
import { Invoice } from 'src/app/models/invoice.model';
import { Client } from 'src/app/models/client.model';
import { ArticleService } from 'src/app/services/article.service';
import { InvoicesService } from 'src/app/services/invoices.service';
import { LineItemService } from 'src/app/services/line-item.service';
import { ClientService } from 'src/app/services/client.service';
/*
To komponento sem imel nekaj težav, saj sem sprva domneval, 
da LineItems ne bi smeli ustvarjati ob ustvarjanju računa, 
vendar sem spremenil svoje mnenje. Ena stvar, ki bi si jo 
želel narediti, če bi imel več časa, je, da bi komponento 
naredil bolj modularno (razdelil na več manjših komponent).
Poleg tega si želim, da bi naredil komponente, ki se bolj 
zanasajo na podajanje podatkov (Input, Output), kot pa na
funkcije storitev
*/
@Component({
  selector: 'app-invoice-form',
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.css']
})
export class InvoiceFormComponent {
  invoice: Invoice;
  artikli: Article[];
  customers: Client[];
  invoiceForm: FormGroup;
  lineItemForm: FormGroup;
  lineItems$: Observable<LineItem[]>;
  totalCost: number = 0;
  editedLineItemIndex: number = -1;
  editedLineItem: LineItem; // Add this property
  lineItemEditForm: FormGroup;
  selectedCustomerId: number;
  selectedCustomerName: string = "";

  todayDate: Date;
  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoicesService,
    private articleService: ArticleService,
    private route: ActivatedRoute,
    private router: Router,
    private ClientService: ClientService,
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
      articleIdEdit: [null, [Validators.required]],
      quantityEdit: [0, [Validators.required, Validators.min(1)]],
    });
    this.lineItemService.setLineItemsToEmpty();
    this.artikli = this.articleService.artikli;
    this.route.params.subscribe((params) => {
      const invoiceId = +params['id'];

      this.customers = this.ClientService.stranke;
      if (invoiceId) {
        this.invoiceService.findInvoiceById(invoiceId).subscribe((invoice) => {
        if (invoice) {
          this.invoice = invoice;
          this.lineItemService.GetRacunLineItemById(invoiceId);
          const invoiceDate = new Date(invoice.dateOfCreation);
          const formattedDate = `${invoiceDate.getFullYear()}-${(invoiceDate.getMonth() + 1)
            .toString()
            .padStart(2, '0')}-${invoiceDate.getDate().toString().padStart(2, '0')}`;    
            this.selectedCustomerId = invoice.clientId;
            const foundArticle = this.customers.find((customer) => customer.id === invoice.clientId);
            this.selectedCustomerName = foundArticle?.name || ''; 
          this.invoiceForm.setValue({
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

  // Preusmeritev na domačo stran
  navigateToRoot(): void {
    this.lineItemService.setLineItemsToEmpty()
    this.totalCost = 0
    this.router.navigate(['/']);
  }
  // Preveri, ali je izbrani datum v prihodnosti
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
    // Ce racun obstaja samo posodobimo vrednosti
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
      //Ce racun se ne obstaja ustvarimo najprej racun ter nato vse vrstice
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
  setLineItem(invoiceId: number): LineItem {
    const lineItem: LineItem = {
      id: 0,
      articleId: 0,
      invoiceId: invoiceId,
      quantity: 0,
    };
    return lineItem;
    }
  onLineItemSubmit(){
    // Preveri, ali je račun že ustvarjen
    if (this.invoice.id != 0){
      let newLineItem = this.setLineItem(this.invoice.id);
      newLineItem.articleId = parseInt(this.lineItemForm.value.articleId);
      newLineItem.quantity = this.lineItemForm.value.quantity;
      //ustvari novo vrstico za racun
      this.lineItemService.createLineItem(newLineItem).subscribe(
        (response) => {
          // Handle the response here
          console.log('Response:', response);
          this.isArticleAlreadySelected(newLineItem.articleId)
        },
        (error) => {
          // Handle errors here
          console.error('Error:', error);
        }
      );
    }
    // Če račun še ni ustvarjen ustvari novo vrstico na računu z začetnimi vrednostmi
    // ki je hranjen samo na lineItems$
    else {
      let newLineItem = this.setLineItem(0);
      newLineItem.articleId = parseInt(this.lineItemForm.value.articleId);
      newLineItem.quantity = this.lineItemForm.value.quantity;
      this.lineItemService.addLineItem(newLineItem);
      this.isArticleAlreadySelected(newLineItem.articleId)
    }
    this.lineItemForm.reset({
      articleId: null, 
      quantity: null,   
    });
    this.lineItemForm.markAsUntouched();
    this.calculateTotalCost();
  }
  //Metoda, ki nam omogoci urejanje izbranih racunskih vrstic
  startEditingLineItem(index: number) {
    this.editedLineItemIndex = index;
    this.lineItems$.subscribe((lineItems) => {
      if (lineItems && lineItems.length > index) {
        this.editedLineItem = { ...lineItems[index] }; // Keep a copy of the original values
        this.lineItemEditForm.patchValue({
          articleIdEdit: this.editedLineItem.articleId,
          quantityEdit: this.editedLineItem.quantity,
        });
      }
    });
  }
  /**
  * Shrani urejeno postavko na računu, oz na lineItems$ če je prišlo do sprememb.
  * Posodobi tudi skupni strošek računa in podatke o postavki prek services, če je račun že ustvarjen.
  */
    saveEditedLineItem(lineItem: LineItem) {
     if( !this.areLineItemsEqual(this.editedLineItem , lineItem)) {
      this.calculateTotalCost();
      if (this.invoice.id) {
        const updatedArticleId = lineItem.articleId;
        const updatedQuantity = lineItem.quantity;
        lineItem.articleId = updatedArticleId;
        lineItem.quantity = updatedQuantity;
        this.lineItemService.updateLineItem(lineItem).subscribe(
          (response) => {
          },
          (error) => {
            // Handle errors here
            console.error('Error:', error);
          }
        );
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
        const updatedArticleId = lineItem.articleId;
        const updatedQuantity = lineItem.quantity;
        lineItem.articleId = updatedArticleId;
        lineItem.quantity = updatedQuantity;
        console.log("this.totalCost updateLineItem ", this.totalCost)
        this.lineItemService.updateLineItem(lineItem);
      }
     }
    this.editedLineItemIndex = -1;
  }

  areLineItemsEqual(lineItem1: LineItem, lineItem2: LineItem): boolean {
    return (
      lineItem1.articleId === lineItem2.articleId &&
      lineItem1.quantity === lineItem2.quantity
    );
  
    }
    /*
    * Ustvari vec novih vrstic na računu z določenim identifikacijskim znakom računa.
    */
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
  /**
  * Izračuna skupni strošek postavk na računu.
  * Uporablja trenutne postavke na računu in cene izdelkov za izračun skupnega stroška.
  */
  calculateTotalCost(): void {
    this.lineItems$
      .pipe(
        filter((lineItems) => !!lineItems),
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
  
  isArticleAlreadySelected(articleId: number): boolean {
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