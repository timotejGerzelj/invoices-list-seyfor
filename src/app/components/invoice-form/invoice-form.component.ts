import { Component, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Artikel } from 'src/app/models/artikel.model';
import { Racun } from 'src/app/models/racun.model';
import { Stranka } from 'src/app/models/stranka.model';
import { ArtikelService } from 'src/app/services/artikel.service';
import { InvoicesService } from 'src/app/services/invoices.service';
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
  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoicesService,
    private artikelService: ArtikelService,
    private route: ActivatedRoute,
    private router: Router,
    private strankaService: StrankaService,
  ) {}

  ngOnInit(): void {
    this.invoiceForm = this.fb.group({
      strankaId: [0, [Validators.required]],
      vrstice: [[], [Validators.required]],
      dateOfCreation: [null, [Validators.required]]
    });
    this.route.params.subscribe((params) => {
      const invoiceId = +params['id'];
      console.log('hello')
      if (invoiceId) {
        console.log('hello2')

      this.invoiceService.findInvoiceById(invoiceId).subscribe((invoice) => {
        console.log(invoice)
        this.artikli = this.artikelService.artikli;
        this.stranke = this.strankaService.stranke;
        console.log("Stranke, ", this.stranke);
        if (invoice) {
            this.invoice = invoice;
            invoice.lineItems.forEach((lineItem) => {
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
            vrstice: invoice.lineItems,
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
}
