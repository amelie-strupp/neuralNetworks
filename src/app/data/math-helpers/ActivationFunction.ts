export enum ActivationFunction {
  tanh,
  relu,
  identity,
  sigmoid,
}
export const activationFunctionList = [
  ActivationFunction.tanh,
  ActivationFunction.relu,
  ActivationFunction.identity,
  ActivationFunction.sigmoid
]
function identity(x: number) {
  return x;
}
function relu(x: number) {
  return x > 0 ? x : 0;
}
function tanh(x: number) {
  return Math.tanh(x);
}
function sigmoid(x: number) {
  return 1 / (1 + Math.exp(-x));
}
function leakyRelu(x: number) {
  return x > 0 ? relu(x) : 0.01 * x;
}
export default function applyActivationFunction(
  f: ActivationFunction,
  x: number
) {
  switch (f) {
    case ActivationFunction.identity:
      return identity(x);
    case ActivationFunction.relu:
      return relu(x);
    case ActivationFunction.tanh:
      return tanh(x);
    case ActivationFunction.sigmoid:
      return sigmoid(x);
  }
}
export function getActivationFunctionName(f: ActivationFunction){
  switch(f){
    case ActivationFunction.identity:
    return 'Identity';
  case ActivationFunction.relu:
    return 'ReLU';
  case ActivationFunction.tanh:
    return 'Tanh';
  case ActivationFunction.sigmoid:
    return 'Sigmoid';
  }
}
export function getActivationFunctionFromName(name: string){
  switch(name){
    case 'Identity':
    return ActivationFunction.identity;
  case 'ReLU':
    return ActivationFunction.relu;
  case 'Tanh':
    return ActivationFunction.tanh;
  case 'Sigmoid':
    return ActivationFunction.sigmoid;
  }
  return null;
}
