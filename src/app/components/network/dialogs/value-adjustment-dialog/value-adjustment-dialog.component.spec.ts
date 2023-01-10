import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValueAdjustmentDialogComponent } from './value-adjustment-dialog.component';

describe('ValueAdjustmentDialogComponent', () => {
  let component: ValueAdjustmentDialogComponent;
  let fixture: ComponentFixture<ValueAdjustmentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ValueAdjustmentDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValueAdjustmentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
