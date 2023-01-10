import DatasetItem from "./DatasetItem";
// This class is used to bundle multiple data points into a dataset
export default class Dataset{
    items: Array<DatasetItem> = [];

    constructor(datasetItems: Array<DatasetItem> ){
        this.items = datasetItems;
        if(this.items.length != 0){
          this._checkWhetherDataFormatValid();
        }
    }
    // Makes sure that all the data items have the same dimensions
    _checkWhetherDataFormatValid(){
      let inputDim = this.items[0].inputDimension;
      let outputDim = this.items[0].outputDimension;
      let wrongInputDim = this.items.some((i)=>i.inputDimension != inputDim);
      let wrongOutputDim = this.items.some((i)=>i.outputDimension != outputDim);
      if(wrongInputDim || wrongOutputDim)
        throw Error("You are using a dataset that does consists of items with multiple different dimensions")
    }
    getDataItems(){
      return this.items;
    }
}
