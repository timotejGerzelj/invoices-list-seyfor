import { Component, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Artikel } from 'src/app/models/artikel.model';
import { RacunVrstica } from 'src/app/models/line-item.model';
import { ArtikelService } from 'src/app/services/artikel.service';
import { InvoicesService } from 'src/app/services/invoices.service';
import { LineItemService } from 'src/app/services/line-item.service';

@Component({
  selector: 'app-line-item-form',
  templateUrl: './line-item-form.component.html',
  styleUrls: ['./line-item-form.component.css']
})
export class LineItemFormComponent {
  racunVrstica: RacunVrstica;
  artikli: Artikel[];
  onSubmit = new EventEmitter<RacunVrstica>();
  isDisabled: boolean = false;
  lineItemForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private artikelService: ArtikelService,
    private invoiceService: InvoicesService,
    private lineItemService: LineItemService
  ) {}

  ngOnInit(): void {
    this.artikli = this.artikelService.artikli;
    this.lineItemForm = this.fb.group({
      artikelId: [0, [Validators.required]], // Update form control name to "strankaId"
      quantity: [0, [Validators.required, Validators.min(1)]] // Update form control name to "quantity"
    });
    this.route.params.subscribe((params) => {
      const lineId = +params['id'];
      if (lineId) {
                // If taskId is provided, try to find and load an existing task.
                this.lineItemService.findLineItemById(lineId).subscribe((lineItem) => {
                  if (lineItem) {
                    this.racunVrstica = lineItem;
                    this.lineItemForm.setValue({
                      artikelId: lineItem.artikelId,
                      quantity: lineItem.kolicina
                    });
                  } else {
                    // Initialize a new task if the task with taskId doesn't exist.
                    this.initializeNewLineItem();
                  }
                });
              } else {
                // Initialize a new task if no taskId is provided in the route.
                this.initializeNewLineItem();
      }
    })
  }

  initializeNewLineItem(): void {
    this.racunVrstica = {
      id: 0,
      artikelId: 0,
      racunId: 1,
      kolicina: 0,
      artikel: undefined
    };
  }



  


  navigateBackToPreviousForm() {
    // Use the router's navigate method to navigate back
    this.router.navigate(['../'], { relativeTo: this.route });
  }
  onSubmitLineRow() {
    console.log(this.racunVrstica.id)
    if (this.racunVrstica.id){
      this.racunVrstica.artikelId = this.lineItemForm.value.artikelId;
      this.racunVrstica.kolicina = this.lineItemForm.value.quantity;
      this.lineItemService.updateLineItem(this.racunVrstica)
    }
    else {
    console.log("Hi?")
    this.racunVrstica.artikelId = parseInt(this.lineItemForm.value.artikelId);
    this.racunVrstica.kolicina = this.lineItemForm.value.quantity;
    this.racunVrstica.artikel = this.artikli.find((artikel) => artikel.id === this.racunVrstica.artikelId)
    this.lineItemService.createLineItem(this.racunVrstica).subscribe(
      (response) => {
        // Handle the response here
        console.log('Response:', response);
      },
      (error) => {
        // Handle errors here
        console.error('Error:', error);
      }
    );

  }

  }
  
}