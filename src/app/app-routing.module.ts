import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvoiceListComponent } from './components/invoices-list/invoice-list.component';
import { InvoiceFormComponent } from './components/invoice-form/invoice-form.component';
import { LineItemFormComponent } from './components/line-item-form/line-item-form.component';

const routes: Routes = [
  {path: '', redirectTo: '/invoicelist', pathMatch: 'full'},
  {path: 'invoicelist', component: InvoiceListComponent},
  {path: 'invoiceform', component: InvoiceFormComponent },
  {path: 'invoiceform/:id', component:InvoiceFormComponent},
  {
    path: 'invoiceform/:invoiceid/:id',
    component: LineItemFormComponent, // Update with your actual component name
  },
  {
    path: 'invoiceform/:invoiceid/new',
    component: LineItemFormComponent, // Update with your actual component name
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
