import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';

@Component({
  selector: 'app-value-adjustment-dialog',
  templateUrl: './value-adjustment-dialog.component.html',
  styleUrls: ['./value-adjustment-dialog.component.sass'],
})
export class ValueAdjustmentDialogComponent {
  // The number the slider should take on the right side (The value can still be increased, but the slider won't move any further)
  @Input() sliderBoundMaxValue: number = 2;
  // The number the slider should take on the left side (The value can still be decreased, but the slider won't move any further)
  @Input() sliderBoundMinValue: number = -2;
  @Input() stepSize: number = 0.25;
  // Which type of value is being adjusted (Used to adjust the displayed title)
  @Input() valueType: "BIAS" | "WEIGHT" = "WEIGHT";
  @Input() inputValue: number = 0;
  @Output() valueChanged = new EventEmitter<number>();
  @ViewChild('sliderBar') sliderBar!: ElementRef;

  // Whether the slider is currently being dragged
  sliderActive: boolean = false;
  sliderPosition: number = 0;
  mouseDragStartXPosition: number = 0;
  // Used to adjust the slider based on the current mouse position whenever it changes
  mouseMoveSubscription!: Subscription;
  mouseUpSubscription!: Subscription;

  // Catch the arrow key actions to use them to adjust the values
  // instead of scrolling
  keyDownSubscription!: Subscription;

  value: number = 0;
  // Used to adjust the offset value - this is the width of the circle that
  // indicates the slider position
  WIDTH_OF_SLIDER_MARK: number = 36;

  activateSlider(event: MouseEvent) {
    this.sliderActive = true;
    this.mouseDragStartXPosition = event.screenX;
  }
  constructor(private cd: ChangeDetectorRef){}
  ngOnChanges(changes: SimpleChanges): void {
    if(this.sliderBar != null){
    // If the input value changes, make sure to sync it up with
    // the display
    if(changes['inputValue']){
      this.setValue(changes['inputValue'].currentValue)
      // Set the slider to the new value
      this.setSliderPositionToValue(this.value);
    }
  }
  }
  ngOnInit() {
    this.mouseMoveSubscription = fromEvent(document, 'mousemove').subscribe(
      (e) => {
        this.mouseMoved(e as MouseEvent);
      }
    );
    this.mouseUpSubscription = fromEvent(document, 'mouseup').subscribe(
      (e) => {
        this.deactivateSlider();
      }
    );
    this.keyDownSubscription = fromEvent(document, 'keydown').subscribe(
      (e) => {
        this.adjustValueOnKeydown(e as KeyboardEvent);
      }
    );
  }
  adjustValueOnKeydown(event: KeyboardEvent){
    // Only react to arrow keys
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      // Prevent the default action (scrolling)
      event.preventDefault();
      // Adjust the value by one step
      if(event.key === 'ArrowUp' || event.key === 'ArrowRight')
        this.setValue(this.value + this.stepSize)
      else if(event.key === 'ArrowDown' || event.key === 'ArrowLeft')
        this.setValue(this.value - this.stepSize)
      // Set the slider to the new value
      this.setSliderPositionToValue(this.value);
    }
  }
  // Sets the value and makes sure it stays in the valid range
  setValue(newValue: number){
    if(newValue > this.sliderBoundMaxValue){
      newValue = this.sliderBoundMaxValue;
    }
    if(newValue < this.sliderBoundMinValue){
      newValue = this.sliderBoundMinValue;
    }
    this.value = newValue;
    this.valueChanged.emit(this.value);
  }
  ngAfterViewInit(){
    this.setValue(this.inputValue)
    this.setSliderPositionToValue(this.inputValue);
    // Has to be called, since changes in a lifecycle hook have been made
    this.cd.detectChanges();
  }
  setSliderPositionToValue(value: number){
    this.sliderPosition = this.convertNumberToPixelPosition(value);
  }
  convertNumberToPixelPosition(x: number){
    x = x - this.sliderBoundMinValue;
    let pixelsOfUnitStep = this.getPixelsOfUnitStep();
    let numberOfUnitSteps = x/this.stepSize;
    return pixelsOfUnitStep * numberOfUnitSteps;
  }
  ngOnDestroy() {
    this.mouseMoveSubscription.unsubscribe();
    this.mouseUpSubscription.unsubscribe();
    this.keyDownSubscription.unsubscribe();
  }
  getDimensionsOfSliderBar(){
    return this.sliderBar.nativeElement.getBoundingClientRect();
  }
  getPixelsOfUnitStep(){
    let dims = this.getDimensionsOfSliderBar();
    let numberOfSteps = (this.sliderBoundMaxValue - this.sliderBoundMinValue)/this.stepSize;
    return dims.width/numberOfSteps;
  }
  getValueToPixelPosition(){
    let pixelsOfUnitStep = this.getPixelsOfUnitStep();
    return (this.sliderPosition/pixelsOfUnitStep)*this.stepSize + this.sliderBoundMinValue;
  }
  adjustValueToSliderPosition(){
    this.setValue(this.getValueToPixelPosition());
  }
  mouseMoved(event: MouseEvent) {
    if (this.sliderActive) {
      let sliderBarDimensions = this.getDimensionsOfSliderBar();
      let pixelsOfUnitStep = this.getPixelsOfUnitStep();
      const getClosestValidStepPosition = (position: number) => {
        let lowerMultipleOfStepSize = position/pixelsOfUnitStep;
        // Closer to the smaller value
        if(lowerMultipleOfStepSize - Math.floor(lowerMultipleOfStepSize) < 0.5){
          return Math.floor(lowerMultipleOfStepSize)*pixelsOfUnitStep
        }
        else{
          return Math.ceil(lowerMultipleOfStepSize)*pixelsOfUnitStep
        }
      }
      let newPosition = event.clientX - sliderBarDimensions.x;
      // Make sure not to leave the valid area with the slider
      if (event.clientX < sliderBarDimensions.left) {
        this.sliderPosition = 0;
      } else if (newPosition > sliderBarDimensions.width) {
        this.sliderPosition = sliderBarDimensions.width;
      } else {
        this.sliderPosition = getClosestValidStepPosition(newPosition);
      }
      this.adjustValueToSliderPosition();
    }
  }

  deactivateSlider() {
    this.sliderActive = false;
  }
}
