import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-simple-dialog',
  templateUrl: './simple-dialog.component.html',
  styleUrls: ['./simple-dialog.component.sass']
})
export class SimpleDialogComponent {
  @Input() title = "";
  @Input() subtitle = "";
}
