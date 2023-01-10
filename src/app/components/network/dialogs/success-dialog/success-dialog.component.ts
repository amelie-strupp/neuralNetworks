import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-success-dialog',
  templateUrl: './success-dialog.component.html',
  styleUrls: ['./success-dialog.component.sass']
})
export class SuccessDialogComponent {
  @Input() wasSuccessful: boolean = false;
  @Output() closeDialog: EventEmitter<void> = new EventEmitter();
  close(){
    this.closeDialog.emit();
  }
}
