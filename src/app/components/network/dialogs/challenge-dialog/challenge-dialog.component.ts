import { Level } from "./../../../../data/static-datasets/Level";
import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-challenge-dialog',
  templateUrl: './challenge-dialog.component.html',
  styleUrls: ['./challenge-dialog.component.sass']
})
export class ChallengeDialogComponent {
  @Output() checkSolution: EventEmitter<void> = new EventEmitter();
  @Input() level?: Level;
  check(){
    this.checkSolution.emit();
  }

}
