import { ActivationFunction, getActivationFunctionName } from '../../math-helpers/ActivationFunction';

export interface NeuronOptions{
  initialBias: number,
  activationFunction: ActivationFunction
}

export default class Neuron {
  bias: number = 0;
  activationFunction: ActivationFunction = ActivationFunction.identity;

  constructor(d?: NeuronOptions) {
    if (d != undefined) {
      this.bias = d.initialBias ?? this.bias;
      this.activationFunction = d.activationFunction ?? this.activationFunction;
    }
  }
  setBias(newValue: number){
    this.bias = newValue;
  }
  setActivationFunction(f: ActivationFunction){
    this.activationFunction = f;
  }
  getActivationFunctionName(){
    return getActivationFunctionName(this.activationFunction)
  }
  hasActivationFunction(){
    return this.activationFunction != ActivationFunction.identity;
  }
}
