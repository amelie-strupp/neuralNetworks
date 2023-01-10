import { Level } from "./../../../data/static-datasets/Level";
import { ActivationFunction, activationFunctionList, getActivationFunctionFromName, getActivationFunctionName } from './../../../data/math-helpers/ActivationFunction';
import { NeuralNetworkManagerService } from './../../../services/neural-network-manager.service';
import {
  Component,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import NeuralNetworkPaintHelper from 'src/app/data/paint-helpers/NeuralNetworkPaintHelper';
import { Color } from 'src/app/data/values/Colors';
import Neuron from 'src/app/data/models/neural_network/Neuron';
import Dataset from 'src/app/data/static-datasets/classes/Dataset';
import DatasetItem from 'src/app/data/static-datasets/classes/DatasetItem';
import { fromEvent, Subscription } from 'rxjs';
import { ErrorLevel } from 'src/app/data/static-datasets/ErrorLevels';

export interface NetworkResult {
  result: Array<number>;
  input: Array<number>;
  desiredOutput: Array<number>;
  error: number;
}

@Component({
  selector: 'app-network',
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.sass'],
})
export class NetworkComponent {
  // Keeps track of the painted weight lines and
  // is used to destroy them, when being repainted
  _paintedWeightLines: Array<Element> = [];
  _paintedWeightLineTexts: Array<Element> = [];
  playAnimationOnNextPaint: boolean = false;

  _paintedInputLines: Array<Element> = [];
  _paintedOutputLines: Array<Element> = [];

  levelConfiguration!: Level;
  selectedDatasetItemIndices: Array<number> = [];
  currentlyDisplayedResults: Array<NetworkResult> = [];

  entireDatasetProcessed: boolean = false;
  totalError: Array<number> = [];
  totalErrorLevels: Array<{
    level: ErrorLevel;
    percentageOfHighErrorBound: number;
  }> = [];

  selectedWeight: {
    layerIndex: number;
    inputNeuronIndex: number;
    outputNeuronIndex: number;
  } | null = null;
  selectedNeuron: { layerIndex: number; neuronIndex: number } | null = null;
  @ViewChild('lineContainer') _svgLineContainer?: ElementRef;

  clickSubscription!: Subscription;
  resizeSubscription!: Subscription;
  dataSwitchSubscription!: Subscription;

  showSuccessDialog: boolean = false;
  hasBeenSuccessful: boolean = false;
  activationFunctionList = activationFunctionList;
  constructor(
    private networkManager: NeuralNetworkManagerService,
    private cd: ChangeDetectorRef
  ) {
    this.initializeLevel();
    this.clickSubscription = fromEvent(document, 'click').subscribe((e) => {
      // Unselect if a click occured that wasn't prevented from bubbling up
      this.deselectNeuron();
      this.deselectWeightLine();
      this.cd.detectChanges();
    });
    this.resizeSubscription = fromEvent(window, 'resize').subscribe((e) => {
      // Make sure to repaint to adjust to the new position
      this._repaintWeightLines();
      this._paintInputToNetworkLines();
      this._paintOutputToNetworkLines();
    });
    this.dataSwitchSubscription = this.networkManager.dataSwitched.subscribe(()=>
    {this.reinitializeData();}
    )
  }
  checkSolution(){
    this.selectEntireDataset();
    if(this.totalError.every((e) => e <= this.levelConfiguration.successBound+0.05)){
      this.hasBeenSuccessful = true;
    }else{
      this.hasBeenSuccessful = false;
    }
    this.showSuccessDialog = true;
  }
  closeSuccessDialog(){
    console.log("Ok");
    this.showSuccessDialog = false;
  }
  reinitializeData(){
    this.initializeLevel();
    this.cd.detectChanges();
    this._clearInputLines();
    this._clearOutputLines();
    this._clearWeightLines();
    this.selectedDatasetItemIndices = [];
    this.entireDatasetProcessed = false;
    this.currentlyDisplayedResults = [];
    this.totalError = [];
    this.totalErrorLevels = [];
    this._paintWeights();
  }

  ngAfterViewInit() {
    if (this._svgLineContainer) {
      this._paintWeights();
    } else {
      throw Error(
        'Could not find the svg line container to paint the weight lines!'
      );
    }
  }
  ngOnDestroy() {
    this.clickSubscription.unsubscribe();
    this.resizeSubscription.unsubscribe();
    this.dataSwitchSubscription.unsubscribe();
  }
  getLayers() {
    return this.networkManager.getLayers();
  }
  initializeLevel() {
    this.levelConfiguration = this.networkManager.getLevelData();
  }
  selectDatasetItem(itemIndex: number) {
    this.playAnimationOnNextPaint = true;
    this.entireDatasetProcessed = false;
    // Currently only allow one or all datasets to be plugged in
    // While selecting a subset is implemented, there currently doesn't
    // seem to be a good reason to do so - however maybe one will come up later :)
    this.selectedDatasetItemIndices = [itemIndex];

    this.runNetworkOnSelectedItems();
    this._paintInputToNetworkLines();
    this._paintOutputToNetworkLines();
    this._repaintWeightLines();
    this.playAnimationOnNextPaint = false;
  }
  getDatasetItems() {
    return this.levelConfiguration.dataset.getDataItems().filter((_, i) => {
      return this.selectedDatasetItemIndices.includes(i);
    });
  }
  selectEntireDataset() {
    this.playAnimationOnNextPaint = true;
    this.selectedDatasetItemIndices = this.levelConfiguration.dataset.items.map(
      (_, i) => i
    );
    this.entireDatasetProcessed = true;
    this._repaintWeightLines();
    this.runNetworkOnSelectedItems();
    this._paintInputToNetworkLines();
    this._paintOutputToNetworkLines();
    this.playAnimationOnNextPaint = false;

  }
  clearInput() {
    this.selectedDatasetItemIndices = [];
    this.entireDatasetProcessed = false;
    this.currentlyDisplayedResults = [];
    this.totalError = [];
    this.totalErrorLevels = [];
    this._clearOutputLines();
    this._clearInputLines();
  }
  dragActivationFunction(f: ActivationFunction, event: DragEvent){
    event.dataTransfer!.setData("text", this.getActivationFunctionName(f));
    event.dataTransfer!.effectAllowed = "copy";
  }
  dragOverAllowed(event: Event){
    event.preventDefault();
  }
  dragEnterAllowed(event: Event){
    event.preventDefault();
  }
  dropActivationFunctionOnNeuron(layerIndex: number, neuronIndex: number, event: any){
    event.preventDefault()
    console.log(event);
    if(event.dataTransfer){
    let functionName = event.dataTransfer.getData('text');
    console.log(functionName);
    let activationFunction = getActivationFunctionFromName(functionName);
    if(activationFunction != null){
        this.setActivationFunctionForNeuron(layerIndex, neuronIndex, activationFunction)
        this.runNetworkOnSelectedItems();
    }
  }
  }
  setActivationFunctionForNeuron(layerIndex: number,
    neuronIndex: number, newFunction: ActivationFunction){
      this.networkManager.setActivationFunctionForNeuron({
        layerIndex, neuronIndex, f: newFunction});
  }
  runNetworkOnSelectedItems() {
    let computationResultArray: Array<Array<number>> = [];
    let resultArray: Array<NetworkResult> = [];
    let selectedItems = this.getDatasetItems();
    for (let item of selectedItems) {
      let result = this.networkManager.applyNetworkToDataItem(item);
      computationResultArray.push(result);

      let itemError = 0;
      for (let i = 0; i < item.desiredOutput.length; ++i) {
        itemError += Math.pow(item.desiredOutput[i] - result[i], 2);
      }
      itemError = Math.sqrt(itemError);
      resultArray.push({
        result: result,
        input: item.values,
        desiredOutput: item.desiredOutput,
        error: itemError,
      });
    }
    if (this.entireDatasetProcessed) {
      this.totalError = this.getMSE(
        selectedItems.map((i) => i.desiredOutput),
        computationResultArray
      );
      this.totalErrorLevels = this.getErrorLevel(this.totalError);
    }
    this.currentlyDisplayedResults = resultArray;
    this.cd.detectChanges();
  }
  getColorForSingleItemError(error: number) {
    let errorLevel =
      this.levelConfiguration.getSingleItemErrorLevel(error);
    return this.getColorForErrorLevel(errorLevel);
  }
  getColorForErrorLevel(level: ErrorLevel) {
    switch (level) {
      case ErrorLevel.low:
        return {
          innerColor: 'var(--green-light)',
          borderColor: 'var(--green)',
        };
      case ErrorLevel.medium:
        return {
          innerColor: 'var(--yellow-light)',
          borderColor: 'var(--yellow)',
        };
      case ErrorLevel.high:
        return { innerColor: 'var(--red-light)', borderColor: 'var(--red)' };
    }
  }
  getSizeForMaxErrorPercentage(errorPercentage: number) {
    let minimumSize = 40;
    let maxSize = 100;
    return (maxSize - minimumSize) * errorPercentage + minimumSize;
  }
  computeResultForSingleDatasetItem(item: DatasetItem) {
    let result = this.networkManager.applyNetworkToDataItem(item);
    let error = this.getMSE([item.desiredOutput], [result]);
    return {
      result: result,
      input: item.values,
      desiredOutput: item.desiredOutput,
      error: error,
    };
  }
  getMSE(
    desiredOutputs: Array<Array<number>>,
    actualOutputs: Array<Array<number>>
  ) {
    // This implementation applies MSE to each component seperatly and returns
    // an array with the different errors - this implementation might not be ideal
    // Number of data points
    let n = desiredOutputs.length;
    // Dimension of the datapoints
    let resultDimension = desiredOutputs[0].length;
    let mseArray: Array<number> = [];
    for (
      let dimensionCounter = 0;
      dimensionCounter < resultDimension;
      ++dimensionCounter
    ) {
      let sum = 0;
      for (let i = 0; i < n; ++i) {
        let innerSum =
          desiredOutputs[i][dimensionCounter] -
          actualOutputs[i][dimensionCounter];
        sum += innerSum * innerSum;
      }
      let MSE = sum / n;
      mseArray.push(MSE);
    }
    console.log(mseArray);
    return mseArray;
  }
  getErrorLevel(mseArray: Array<number>) {
    return mseArray.map((error) =>
      this.levelConfiguration.getMSEErrorLevel(error)
    );
  }
  getColorForNeuron(neuron: Neuron) {
    let colorBasedOnWeight = NeuralNetworkPaintHelper.getColorFromValue({
      value: neuron.bias,
      max: this.levelConfiguration.validValueConfiguration.maxBias,
      min: this.levelConfiguration.validValueConfiguration.minBias,
    });
    return colorBasedOnWeight;
  }
  clickedNeuron(
    layerIndex: number,
    neuronIndex: number,
    type: 'LEFT' | 'RIGHT',
    event: Event
  ) {
    // If the neuron is already select - adjust the bias
    if (
      this.selectedNeuron?.layerIndex == layerIndex &&
      this.selectedNeuron.neuronIndex == neuronIndex
    ) {
      if (type == 'RIGHT') {
        this.decreaseBias(layerIndex, neuronIndex);
      } else {
        this.increaseBias(layerIndex, neuronIndex);
      }
    }
    // Otherwise select it first
    else {
      this.selectNeuron(layerIndex, neuronIndex);
    }
    event.stopPropagation();
    event.preventDefault();
    return false;
  }

  getNeuronBoxShadowValue(
    layerIndex: number,
    neuronIndex: number,
    neuron: Neuron
  ) {
    // Only display a box-shadow if the neuron is currently selected
    if (this.neuronIsSelected(layerIndex, neuronIndex)) {
      return '0 0 15px ' + this.getColorForNeuron(neuron).backgroundColor;
    } else {
      return '';
    }
  }
  neuronIsSelected(layerIndex: number, neuronIndex: number) {
    return (
      layerIndex == this.selectedNeuron?.layerIndex &&
      neuronIndex == this.selectedNeuron?.neuronIndex
    );
  }
  getColorForActivationFunction(f: ActivationFunction) {
    return NeuralNetworkPaintHelper.getColorForActivationFunction(f);
  }
  getActivationFunctionName(f: ActivationFunction){
    return getActivationFunctionName(f);
  }
  increaseBias(layerIndex: number, neuronIndex: number) {
    let previousValue = this.networkManager.getBias({
      layerIndex,
      neuronIndex,
    });
    let newValue =
      previousValue + this.levelConfiguration.validValueConfiguration.biasStepSize;
    this.updateBias({
      layerIndex: layerIndex,
      neuronIndex: neuronIndex,
      value: newValue,
    });
  }
  decreaseBias(layerIndex: number, neuronIndex: number) {
    let previousValue = this.networkManager.getBias({
      layerIndex,
      neuronIndex,
    });
    let newValue =
      previousValue - this.levelConfiguration.validValueConfiguration.biasStepSize;
    this.updateBias({
      layerIndex: layerIndex,
      neuronIndex: neuronIndex,
      value: newValue,
    });
    // Prevent the context menu from showing if this is triggered by an event
    return false;
  }
  updateWeight(d: {
    layerIndex: number;
    inputNeuronIndex: number;
    outputNeuronIndex: number;
    updateBy: number;
  }) {
    let previousValue = this.networkManager.getWeight({
      layerIndex: d.layerIndex,
      inputNeuronIndex: d.inputNeuronIndex,
      outputNeuronIndex: d.outputNeuronIndex,
    });
    // If this function is called with an invalid weight - return and notify the user
    if (previousValue == null) {
      throw Error('Tried increasing a weight that does not exist!');
      return;
    }
    let newValue = previousValue + d.updateBy;
    this.networkManager.setWeight({
      layerIndex: d.layerIndex,
      inputNeuronIndex: d.inputNeuronIndex,
      outputNeuronIndex: d.outputNeuronIndex,
      value: newValue,
    });
    this.runNetworkOnSelectedItems();
    // Prevent the context menu from showing if this is triggered by an event
    return false;
  }
  updateBias(d: { layerIndex: number; neuronIndex: number; value: number }) {
    this.networkManager.setBias(d);
    this.runNetworkOnSelectedItems();
  }
  _paintWeights() {
    // Make sure to first clear the ones potentially already painted before painting new ones
    this._clearWeightLines();
    let layers = this.getLayers();
    let layerIndex = 0;
    for (let layer of layers) {
      // No weights to paint for the first (input) layer
      if (layerIndex == 0) {
        layerIndex++;
        continue;
      }
      let numberOfNeuronsInPreviousLayer = layer.numberOfNeuronsInPreviousLayer;
      let neuronsInLayer = layer.numberOfNeurons;
      for (let i = 0; i < neuronsInLayer; ++i) {
        for (let j = 0; j < numberOfNeuronsInPreviousLayer; ++j) {
          this._paintWeight(layerIndex, j, i);
        }
      }
      layerIndex++;
    }
  }
  _paintWeight(
    layerIndex: number,
    startNeuronIndex: number,
    endNeuronIndex: number
  ) {
    // Getting the position for the line
    const getCenterPositionOfNeuronElement = (neuronElement: Element) => {
      let position = neuronElement.getBoundingClientRect();
      return {
        left:
          position.left +
          document.documentElement.scrollLeft +
          position.width / 2,
        // Make sure to adjust to the scroll
        top:
          position.top +
          document.documentElement.scrollTop +
          position.height / 2,
      };
    };
    let startNeuron = this._getElementToNeuron(
      layerIndex - 1,
      startNeuronIndex
    );
    let endNeuron = this._getElementToNeuron(layerIndex, endNeuronIndex);
    let weight = this.networkManager.getWeight({
      layerIndex: layerIndex,
      inputNeuronIndex: startNeuronIndex,
      outputNeuronIndex: endNeuronIndex,
    });

    let startPosition = getCenterPositionOfNeuronElement(startNeuron);
    let endPosition = getCenterPositionOfNeuronElement(endNeuron);

    // Paint the actual line
    let lineElement = this._paintLineBetweenCoordinates(
      startPosition.left,
      startPosition.top,
      endPosition.left,
      endPosition.top
    );
    this._paintedWeightLines.push(lineElement);
    lineElement.classList.add('weight-line');
    // Paint the text indicating the weight of the line
    let directionVector = {
      x: endPosition.left - startPosition.left,
      y: endPosition.top - startPosition.top,
    };
    let orthogonalVector = {
      x: directionVector.y,
      y: -directionVector.x,
    };
    let lengthOrthogonalVector = Math.sqrt(
      orthogonalVector.x * orthogonalVector.x +
        orthogonalVector.y * orthogonalVector.y
    );
    let normalizedOrthogonalVector = {
      x: orthogonalVector.x / lengthOrthogonalVector,
      y: orthogonalVector.y / lengthOrthogonalVector,
    };
    let textElement = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'text'
    );
    textElement =
      this._svgLineContainer?.nativeElement.appendChild(textElement);
    // Only show at most two digits after the point
    textElement.textContent = `${Math.round(weight! * 100) / 100}`;
    textElement.setAttribute(
      'x',
      `${
        startPosition.left +
        directionVector.x / 4 +
        normalizedOrthogonalVector.x * 16
      }`
    );
    textElement.setAttribute(
      'y',
      `${
        startPosition.top +
        directionVector.y / 4 +
        normalizedOrthogonalVector.y * 16
      }`
    );
    textElement.classList.add('weight-text');
    this._paintedWeightLineTexts.push(textElement);
    if (this.playAnimationOnNextPaint) {
      // Show the information flow
      let pointElement = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'circle'
      );
      pointElement =
        this._svgLineContainer?.nativeElement.appendChild(pointElement);
      pointElement.setAttribute(
        'cx',
        `${
          startPosition.left +
          directionVector.x / 4 +
          normalizedOrthogonalVector.x * 20
        }`
      );
      pointElement.setAttribute('r', `16`);
      pointElement.setAttribute(
        'cy',
        `${
          startPosition.top +
          directionVector.y / 4 +
          normalizedOrthogonalVector.y * 20
        }`
      );
      pointElement.setAttribute('visibility', 'hidden');
      pointElement.classList.add('information-circle-item');
      let runningDuration = 1200;
      pointElement.animate(
        [
          {
            cx: `${startPosition.left}px`,
            cy: `${startPosition.top}px`,
            visibility: 'visible',
          },
          {
            cx: `${endPosition.left}px`,
            cy: `${endPosition.top}px`,
          },
        ],
        {
          duration: runningDuration,
          delay: (layerIndex - 1) * runningDuration - 400,
          iterations: 1,
          fill: 'forwards',
          easing: 'ease-in',
        }
      );
      // Remove the information point after it has reached the other side
      setTimeout(() => {
        pointElement.remove();
      }, (layerIndex - 1) * runningDuration + runningDuration);
    }

    // If getting the weight failed, just paint the weight line in white
    let colorBasedOnWeight: string | Color = Color.white;
    if (weight != null) {
      colorBasedOnWeight = NeuralNetworkPaintHelper.getColorFromValue({
        value: weight,
        max: this.levelConfiguration.validValueConfiguration.maxWeight,
        min: this.levelConfiguration.validValueConfiguration.minWeight,
      }).backgroundColor;
      let widthBasedOnWeight = NeuralNetworkPaintHelper.getWidthFromValue({
        value: weight,
        max: this.levelConfiguration.validValueConfiguration.maxWeight,
        min: this.levelConfiguration.validValueConfiguration.minWeight,
      });
      lineElement.setAttribute('stroke-width', `${widthBasedOnWeight}px`);
    }
    // Show glow if element is currently selected
    if (
      this.selectedWeight != null &&
      this.selectedWeight.layerIndex == layerIndex &&
      this.selectedWeight.inputNeuronIndex == startNeuronIndex &&
      this.selectedWeight.outputNeuronIndex == endNeuronIndex
    ) {
      lineElement.setAttribute(
        'filter',
        `drop-shadow(0 0 7px ${colorBasedOnWeight})`
      );
    }
    lineElement.setAttribute('stroke', colorBasedOnWeight);
    let clickHandler = (event: Event, type: 'LEFT' | 'RIGHT') => {
      // To prevent a deselection from happening
      event.stopPropagation();
      let updateBy =
        type == 'LEFT'
          ? this.levelConfiguration.validValueConfiguration.weightStepSize
          : -this.levelConfiguration.validValueConfiguration.weightStepSize;
      // If a selected weight is clicked twice - so it is already selected - adjust the weight
      if (
        this.selectedWeight != null &&
        this.selectedWeight.layerIndex == layerIndex &&
        this.selectedWeight.inputNeuronIndex == startNeuronIndex &&
        this.selectedWeight.outputNeuronIndex == endNeuronIndex
      ) {
        this.deselectNeuron();
        this.updateWeight({
          layerIndex: layerIndex,
          inputNeuronIndex: startNeuronIndex,
          outputNeuronIndex: endNeuronIndex,
          updateBy: updateBy,
        });
        // Update the lines to make changes visible
        this._repaintWeightLines();
      }
      // Otherwise simply select it
      else {
        let weight = this.networkManager.getWeight({
          layerIndex: layerIndex,
          inputNeuronIndex: startNeuronIndex,
          outputNeuronIndex: endNeuronIndex,
        })!;
        let colorBasedOnWeight = NeuralNetworkPaintHelper.getColorFromValue({
          value: weight,
          max: this.levelConfiguration.validValueConfiguration.maxWeight,
          min: this.levelConfiguration.validValueConfiguration.minWeight,
        }).backgroundColor;
        this.selectWeightLine(lineElement, colorBasedOnWeight, {
          layerIndex: layerIndex,
          inputNeuronIndex: startNeuronIndex,
          outputNeuronIndex: endNeuronIndex,
        });
      }
      // Prevent the context menu from showing in case this was triggered by a right-click
      event.preventDefault();
      return false;
    };
    // Add the event listeners to react to the click events
    // Those will be automatically removed with the lines
    // SOURCE: https://stackoverflow.com/questions/12528049/if-a-dom-element-is-removed-are-its-listeners-also-removed-from-memory

    // Left/Right Click:
    lineElement.addEventListener('click', (event) => {
      return clickHandler(event, 'LEFT');
    });
    lineElement.addEventListener('contextmenu', (event) => {
      return clickHandler(event, 'RIGHT');
    });
  }
  selectWeightLine(
    elementRef: Element,
    colorBasedOnWeight: string,
    d: {
      layerIndex: number;
      inputNeuronIndex: number;
      outputNeuronIndex: number;
    }
  ) {
    // Remove selected class from previously selected weight
    this.deselectWeightLine();
    // Make sure to also not select a neuron at the same time
    this.deselectNeuron();
    this.selectedWeight = d;
    elementRef.setAttribute(
      'filter',
      `drop-shadow(0 0 7px ${colorBasedOnWeight})`
    );
  }
  deselectWeightLine() {
    for (let element of this._paintedWeightLines) {
      element.setAttribute('filter', '');
    }
    this.selectedWeight = null;
  }
  deselectNeuron() {
    this.selectedNeuron = null;
    this.cd.detectChanges();
  }
  selectNeuron(layerIndex: number, neuronIndex: number) {
    // Make sure to remove the selection of a weight if one is selected
    this.deselectWeightLine();
    this.selectedNeuron = { layerIndex: layerIndex, neuronIndex: neuronIndex };
  }
  setValueOfSelectedNeuron(newValue: number) {
    if (this.selectedNeuron != null)
      this.updateBias({
        layerIndex: this.selectedNeuron.layerIndex,
        neuronIndex: this.selectedNeuron.neuronIndex,
        value: newValue,
      });
    this.cd.detectChanges();
  }
  getValueOfSelectedNeuron() {
    if (this.selectedNeuron != null) {
      let value = this.networkManager.getBias({
        layerIndex: this.selectedNeuron.layerIndex,
        neuronIndex: this.selectedNeuron.neuronIndex,
      });
      return value;
    }
    return 0;
  }
  setValueOfSelectedWeight(newValue: number) {
    if (this.selectedWeight != null) {
      this.networkManager.setWeight({
        layerIndex: this.selectedWeight.layerIndex,
        inputNeuronIndex: this.selectedWeight.inputNeuronIndex,
        outputNeuronIndex: this.selectedWeight.outputNeuronIndex,
        value: newValue,
      });
      this.runNetworkOnSelectedItems();
      this._repaintWeightLines();
    }
  }
  getValueOfSelectedWeight() {
    if (this.selectedWeight != null) {
      let value = this.networkManager.getWeight(this.selectedWeight)!;
      return value;
    }
    return 0;
  }
  _paintLineBetweenCoordinates(x1: number, y1: number, x2: number, y2: number) {
    let lineElement = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'line'
    );
    lineElement =
      this._svgLineContainer!.nativeElement.appendChild(lineElement);

    // Setting the start and end points
    lineElement.setAttribute('x1', `${x1}`);
    lineElement.setAttribute('y1', `${y1}`);
    lineElement.setAttribute('x2', `${x2}`);
    lineElement.setAttribute('y2', `${y2}`);
    return lineElement;
  }
  _repaintWeightLines() {
    this._paintWeights();
  }
  // The lines that connect the selected input to the network
  _paintInputToNetworkLines() {
    this._clearInputLines();
    for (let index of this.selectedDatasetItemIndices) {
      this._paintInputToNetworkLine(index);
    }
  }
  // The lines that connect the output to the network
  _paintOutputToNetworkLines() {
    // Make sure the output element has been rendered before trying to connect it
    // Otherwise the code won't be able to draw the line
    // SOURCE: https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
    let waitForOutputElementToAppear = (index: number) => {
      let selector = `[data-result-item-index="${index}"]`;
      return new Promise((resolve) => {
        if (document.querySelector(selector)) {
          return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver((mutations) => {
          if (document.querySelector(selector)) {
            resolve(document.querySelector(selector));
            observer.disconnect();
          }
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });
      });
    };
    this._clearOutputLines();
    let numberOfResultItems = this.currentlyDisplayedResults.length;
    for (let index = 0; index < numberOfResultItems; ++index) {
      waitForOutputElementToAppear(index).then(() =>
        this._paintOutputToNetworkLine(index)
      );
    }
  }
  _paintInputToNetworkLine(dataIndex: number) {
    const getCenterPositionOfElement = (element: Element) => {
      let position = element.getBoundingClientRect();
      return {
        left:
          position.left +
          document.documentElement.scrollLeft +
          position.width / 2,
        top:
          position.top +
          document.documentElement.scrollTop +
          position.height / 2,
      };
    };
    // Connect to all neurons in the input layer
    let inputLayer = this.getLayers()[0];
    let itemConnectionCircle = this._getConnectionElementToInput(dataIndex);
    let inputPosition = getCenterPositionOfElement(itemConnectionCircle);
    for (
      let neuronIndex = 0;
      neuronIndex < inputLayer.numberOfNeurons;
      ++neuronIndex
    ) {
      let neuronElement = this._getElementToNeuron(0, neuronIndex);
      let neuronPosition = getCenterPositionOfElement(neuronElement);
      let lineElement = this._paintLineBetweenCoordinates(
        inputPosition.left,
        inputPosition.top,
        neuronPosition.left,
        neuronPosition.top
      );
      this._paintedInputLines.push(lineElement);
      lineElement.classList.add('input-line');
    }
  }
  _paintOutputToNetworkLine(resultIndex: number) {
    const getCenterPositionOfElement = (element: Element) => {
      let position = element.getBoundingClientRect();
      return {
        left:
          position.left +
          document.documentElement.scrollLeft +
          position.width / 2,
        top:
          position.top +
          document.documentElement.scrollTop +
          position.height / 2,
      };
    };
    // Connect to all neurons in the input layer
    let layers = this.getLayers();
    let outputLayerIndex = layers.length - 1;
    let outputLayer = layers[outputLayerIndex];
    let itemConnectionCircle = this._getConnectionElementToOutput(resultIndex);
    let inputPosition = getCenterPositionOfElement(itemConnectionCircle);
    for (
      let neuronIndex = 0;
      neuronIndex < outputLayer.numberOfNeurons;
      ++neuronIndex
    ) {
      let neuronElement = this._getElementToNeuron(
        outputLayerIndex,
        neuronIndex
      );
      let neuronPosition = getCenterPositionOfElement(neuronElement);
      let lineElement = this._paintLineBetweenCoordinates(
        inputPosition.left,
        inputPosition.top,
        neuronPosition.left,
        neuronPosition.top
      );
      this._paintedOutputLines.push(lineElement);
      lineElement.classList.add('output-line');
    }
  }
  // Removes all the currently displayed weight lines
  _clearWeightLines() {
    for (let line of this._paintedWeightLines) {
      line.remove();
    }
    // Also remove the weight texts that belong to the weight lines
    for (let textElement of this._paintedWeightLineTexts) {
      textElement.remove();
    }
  }
  _clearInputLines() {
    for (let line of this._paintedInputLines) {
      line.remove();
    }
  }
  _clearOutputLines() {
    for (let line of this._paintedOutputLines) {
      line.remove();
    }
  }
  _getElementToNeuron(layerIndex: number, neuronIndex: number) {
    let layer = document.querySelectorAll(
      `[data-layer-index="${layerIndex}"]`
    )[0];
    return layer.querySelectorAll(`[data-neuron-index="${neuronIndex}"]`)[0];
  }

  // Returns a reference to the little connection dot on the input item with the provided index
  _getConnectionElementToInput(itemIndex: number) {
    let connectionElement = document.querySelectorAll(
      `[data-dataset-item-index="${itemIndex}"]`
    )[0];
    return connectionElement;
  }
  // Returns a reference to the little connection dot on the input item with the provided index
  _getConnectionElementToOutput(itemIndex: number) {
    let connectionElement = document.querySelectorAll(
      `[data-result-item-index="${itemIndex}"]`
    )[0];
    console.log(connectionElement);
    return connectionElement;
  }
}
