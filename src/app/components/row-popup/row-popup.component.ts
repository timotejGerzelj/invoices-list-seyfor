import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Artikel } from 'src/app/models/artikel.model';
import { RacunVrstica } from 'src/app/models/line-item.model';
import { ArtikelService } from 'src/app/services/artikel.service';

@Component({
  selector: 'app-row-popup',
  templateUrl: './row-popup.component.html',
  styleUrls: ['./row-popup.component.css']
})
export class RowPopupComponent {
  rowForm: FormGroup;
  @Input() row: RacunVrstica;
  artikli: Artikel[]
  constructor(private fb: FormBuilder,
    private artikelService: ArtikelService,
    ) {
    
  }
  ngOnInit(): void {
    
    this.rowForm = this.fb.group({
      artikel: [null, Validators.required],
      kvantiteta: [1, [Validators.required, Validators.min(1)]],
    });  
    
  }
  saveRow(): void {
    // Implement the logic to save the row here
    // You can emit an event or call a service to save the data
    // Close the popup when done
  }

}
