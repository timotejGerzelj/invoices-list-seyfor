import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { InvoiceListComponent } from './components/invoices-list/invoice-list.component';
import { HttpClientModule } from '@angular/common/http';
import { InvoiceFormComponent } from './components/invoice-form/invoice-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RowPopupComponent } from './components/row-popup/row-popup.component';

@NgModule({
  declarations: [
    AppComponent,
    InvoiceFormComponent,
    InvoiceListComponent,
    RowPopupComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
