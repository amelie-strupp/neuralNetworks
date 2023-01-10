import { ActivationFunction } from './../../math-helpers/ActivationFunction';
import DatasetItem from "../../static-datasets/classes/DatasetItem";
import Layer, { LayerOptions } from "./Layer";

export interface NeuralNetworkOptions{
  layerOptions: Array<LayerOptions>
}

export default class NeuralNetwork{
  layers: Array<Layer> = [];
  constructor(options: NeuralNetworkOptions){
    this._initializeLayers(options.layerOptions)
  }
  _initializeLayers(layerOptions: Array<LayerOptions>){
    let layerIndex = 0;
    for(let layerConfiguration of layerOptions){
      let isInputLayer = layerIndex == 0;
      let layer = new Layer({
        network: this,
        options: layerConfiguration,
      isInputLayer: isInputLayer,
      numberOfNeuronsInPreviousLayer: isInputLayer ? 0 : layerOptions[layerIndex-1].numberOfNeurons})
      this.layers.push(layer);
      layerIndex += 1;
    }
  }
  getPreviousLayer(layer: Layer){
    let layerIndex = this.layers.findIndex((layerInArray) => layer == layerInArray);
    // Layer not in network - should not happen
    if(layerIndex == -1){
      throw new Error("Tried to get the previous layer of a layer that was not in the network")
      return null;
    }
    // The first layer does not have a previous layer
    if(layerIndex == 0){
      return null;
    }
    return this.layers[layerIndex-1];
  }
  getWeight(d: {layerIndex: number, inputNeuronIndex: number, outputNeuronIndex: number}){
    return this.layers[d.layerIndex].getWeight(d.inputNeuronIndex, d.outputNeuronIndex)
  }
  setActivationFunctionForNeuron(d: {layerIndex: number,
    neuronIndex: number, f: ActivationFunction}){
      this.layers[d.layerIndex].setActivationFunctionForNeuron(d.neuronIndex, d.f);
  }
  setWeight(d: {layerIndex: number, inputNeuronIndex: number, outputNeuronIndex: number, value: number}){
    this.layers[d.layerIndex].setWeight(d);
  }
  getBias(d: {layerIndex: number, neuronIndex: number}){
    return this.layers[d.layerIndex].getBias({neuronIndex: d.neuronIndex});
  }
  setBias(d: {layerIndex: number, neuronIndex: number, value: number}){
    this.layers[d.layerIndex].setBias({neuronIndex: d.neuronIndex, value: d.value});
  }
  applyToData(dataItem: DatasetItem){
    let inputData = dataItem.values;
    for(let layer of this.layers){
      inputData = layer.applyToDataArray(inputData);
    }
    return inputData;
  }
}
