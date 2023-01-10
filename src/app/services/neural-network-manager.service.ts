import { levels } from '../data/static-datasets/levels';
import { Injectable } from '@angular/core';
import NeuralNetwork from '../data/models/neural_network/NeuralNetwork';
import Dataset from '../data/static-datasets/classes/Dataset';
import DatasetItem from '../data/static-datasets/classes/DatasetItem';
import WeightMatrix from '../data/models/neural_network/WeightMatrix';
import Matrix from '../data/math-helpers/Matrix';
import { ActivationFunction } from '../data/math-helpers/ActivationFunction';
import { Level } from "../data/static-datasets/Level";
import { Subject } from 'rxjs';
/**
 * This service is reponsible for always providing and updating the data of the currently
 * displayed neural network
 */
@Injectable({
  providedIn: 'root',
})
export class NeuralNetworkManagerService {
  _neuralNetwork!: NeuralNetwork;
  _dataset?: Dataset;
  _levelData: Level;
  dataSwitched: Subject<void> = new Subject();
  constructor() {
    this._levelData = levels[0].levels[0];
    this._initializeNetwork();
  }
  switchLevel(newLevel: Level){
    this._levelData = newLevel;
    this._initializeNetwork();
    this.dataSwitched.next();
  }
  _initializeNetwork(){
    this._neuralNetwork = new NeuralNetwork(this._levelData.initialNetworkConfiguration);
  }
  getDataset() {
    return this._dataset;
  }
  getLevelData(){
    return this._levelData;
  }
  getLayers() {
    return this._neuralNetwork.layers;
  }
  setActivationFunctionForNeuron(d: {layerIndex: number,
    neuronIndex: number,
    f: ActivationFunction}){
      this._neuralNetwork.setActivationFunctionForNeuron(d);
  }
  getWeight(d: {
    layerIndex: number;
    inputNeuronIndex: number;
    outputNeuronIndex: number;
  }) {
    return this._neuralNetwork.getWeight(d);
  }
  setWeight(d: {
    layerIndex: number;
    inputNeuronIndex: number;
    outputNeuronIndex: number;
    value: number;
  }) {
    this._neuralNetwork.setWeight(d);
  }
  getBias(d: { layerIndex: number; neuronIndex: number }) {
    return this._neuralNetwork.getBias(d);
  }
  setBias(d: { layerIndex: number; neuronIndex: number; value: number }) {
    this._neuralNetwork.setBias(d);
  }
  applyNetworkToDataItem(item: DatasetItem) {
    return this._neuralNetwork.applyToData(item);
  }
}
