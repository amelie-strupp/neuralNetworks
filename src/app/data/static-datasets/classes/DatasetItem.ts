export default class DatasetItem{
    values: Array<number> = []
    desiredOutput: Array<number> = []
    constructor(d: {
        values: Array<number>,
        desiredOutput: Array<number>
    }){
        this.values = d.values;
        this.desiredOutput = d.desiredOutput;

    }
    get inputDimension(){
      return this.values.length;
    }
    get outputDimension(){
      return this.desiredOutput.length;
    }
}
