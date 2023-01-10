import { ActivationFunction } from './../../math-helpers/ActivationFunction';
import { visitAll } from "@angular/compiler";
import applyActivationFunction from "../../math-helpers/ActivationFunction";
import Matrix from "../../math-helpers/Matrix";
import DatasetItem from "../../static-datasets/classes/DatasetItem";
import NeuralNetwork from "./NeuralNetwork";
import Neuron, { NeuronOptions } from "./Neuron";
import WeightMatrix from "./WeightMatrix";
export interface LayerOptions{
  numberOfNeurons: number,
  initialWeightMatrix?: Matrix,
  neuronConfiguration?: Array<NeuronOptions>
}
export default class Layer{
  // The neural network this layer belongs to
  network: NeuralNetwork;
  // The number of neurons in this layer
  numberOfNeurons!: number;
  // The neurons that this layer containes
  neurons: Array<Neuron> = [];
  // Whether this layer is the input layer
  isInputLayer: boolean;
  // The matrix containing the weights between this and the previous layer
  weightMatrix?: WeightMatrix;
  constructor(
    d: {
      network: NeuralNetwork,
      options: LayerOptions,
      numberOfNeuronsInPreviousLayer: number
      isInputLayer: boolean
    }){
    this.network = d.network;
    this.isInputLayer = d.isInputLayer;
    this._initalizeNeurons(d.options.numberOfNeurons, d.options.neuronConfiguration);
    // Only set the weights if there are any, so if this layer is not the input layer
    if(!this.isInputLayer && !d.options.initialWeightMatrix){
      this._initializeWeights(d.numberOfNeuronsInPreviousLayer);
    }
    // If an initial weight matrix has been passed in - use it
    else if(d.options.initialWeightMatrix){
      this.weightMatrix = new WeightMatrix({matrix: d.options.initialWeightMatrix});
    }
  }
  _initalizeNeurons(numberOfNeurons: number, neuronConfigurations: Array<NeuronOptions> | undefined){
    this.numberOfNeurons = numberOfNeurons;
    for(let i = 0; i < this.numberOfNeurons; ++i ){
      if(neuronConfigurations)
        this.neurons.push(new Neuron(neuronConfigurations[i]));
        else{
          this.neurons.push(new Neuron());
        }
    }
  }
  _initializeWeights(numberOfNeuronsInPreviousLayer: number){
    this.weightMatrix = new WeightMatrix({inputCount: numberOfNeuronsInPreviousLayer, outputCount: this.numberOfNeurons});
  }

  getNeurons(){
    return this.neurons;
  }
  setActivationFunctionForNeuron(neuronIndex: number, f: ActivationFunction){
    this.neurons[neuronIndex].setActivationFunction(f);
  }
  setBias(d: {neuronIndex: number, value: number}){
    this.neurons[d.neuronIndex].setBias(d.value);
  }
  getBias(d: {neuronIndex: number}){
    return this.neurons[d.neuronIndex].bias;
  }
  getWeight(inputNeuronIndex: number, outputNeuronIndex: number){
    if(this.weightMatrix)
      return this.weightMatrix.getWeight(inputNeuronIndex, outputNeuronIndex);
    else
      return null;
  }
  setWeight(d: {value: number, inputNeuronIndex: number, outputNeuronIndex: number}){
    if(this.weightMatrix)
      this.weightMatrix.setWeight(d.inputNeuronIndex, d.outputNeuronIndex, d.value);
  }
  applyToDataArray(data: Array<number>){
    if(this.isInputLayer){
      return this._applyActivationFunctions(this._applyBiases(data));
    }
    else{
      let result = this._applyWeights(data);
      result = this._applyBiases(result);
      result = this._applyActivationFunctions(result);
      return result;
    }
  }
  _applyActivationFunctions(input: Array<number>){
    let output = []
    let i = 0;
    for(let neuron of this.neurons){
      output.push( applyActivationFunction(neuron.activationFunction, input[i]))
      i+=1;
    }
    console.log("Applied: ", output);
    return output;
  }
  _applyWeights(input: Array<number>){
    return this.weightMatrix!.multiplyWith(input);
  }
  _applyBiases(input: Array<number>){
    let componentCounter = 0;
    let output = []
    for(let neuron of this.neurons){
      output.push(input[componentCounter] + neuron.bias);
      ++componentCounter;
    }
    return output;
  }
  get numberOfNeuronsInPreviousLayer(): number{
    let numberOfNeurons = this.network.getPreviousLayer(this)?.numberOfNeurons;
    if(numberOfNeurons == null){
      return 0
    }else{
      return numberOfNeurons;
    }
  }
}
