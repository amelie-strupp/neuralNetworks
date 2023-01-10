import Matrix from "../../math-helpers/Matrix"

export default class WeightMatrix{
  _matrix: Matrix;
  constructor(d: {inputCount?: number, outputCount?: number, matrix?: Matrix}){
    if(d.matrix){
      this._matrix = d.matrix;
    }else{
          this._matrix = Matrix.filledWithConstant(d.inputCount ?? 0, d.outputCount ?? 0, 1);

    }
  }
  getWeight(inputNeuronIndex: number, outputNeuronIndex: number){
    return this._matrix.element(inputNeuronIndex, outputNeuronIndex);
  }
  setWeight(inputNeuronIndex: number, outputNeuronIndex: number, value: number){
    this._matrix.set(inputNeuronIndex, outputNeuronIndex, value);
  }
  multiplyWith(input: Array<number>){
    let inputAsVector = Matrix.getColumnVectorFromArray(input);
    return this._matrix.transpose().multiply(inputAsVector).asVector();
  }
}
