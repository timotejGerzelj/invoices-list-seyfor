import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RowPopupComponent } from './row-popup.component';

describe('RowPopupComponent', () => {
  let component: RowPopupComponent;
  let fixture: ComponentFixture<RowPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RowPopupComponent]
    });
    fixture = TestBed.createComponent(RowPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
