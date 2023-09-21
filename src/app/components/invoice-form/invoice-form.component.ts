import { Component, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Racun } from 'src/app/models/racun.model';
import { InvoicesService } from 'src/app/services/invoices.service';

@Component({
  selector: 'app-invoice-form',
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.css']
})
export class InvoiceFormComponent {
  invoice: Racun;
  onSubmit = new EventEmitter<Racun>()
  isDisabled: boolean = false;
  invoiceForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoicesService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.invoiceForm = this.fb.group({
      strankaId: [0, [Validators.required]],
      vrstice: [[], [Validators.required]]
    });
    this.route.params.subscribe((params) => {
      const invoiceId = +params['id'];
      console.log('hello')
      if (invoiceId) {
        console.log('hello2')

      this.invoiceService.findInvoiceById(invoiceId).subscribe((invoice) => {
        console.log(invoice)

        if (invoice) {
          this.invoice = invoice;
          this.invoiceForm.setValue({
            strankaId: invoice.strankaId,
            vrstice: invoice.lineItems
          })
         }
          else {
            // Initialize a new task if the task with taskId doesn't exist.
            this.initializeNewTask();
          }
        
      });
      }
      else {
      // Initialize a new task if no taskId is provided in the route.
      this.initializeNewTask();
    }

    });
      

    }
  
  onTaskSubmit(): void {
     
  }
  initializeNewTask(): void {
    this.invoice = {
      id: -1,
      dateOfCreation: new Date(),
      znesek: 0,
      orgId: 0,
      strankaId: 0,
      artikelId: 0,
      lineItems: []
    };
  }
//  import { RacunVrstica } from "./line-item.model";
/*
export interface Racun {
    id: number;
    dateOfCreation: Date;
    znesek: number;
    orgId: number;
    strankaId: number;
    artikelId: number;
    vrstice: RacunVrstica[];
  }
  */

}
