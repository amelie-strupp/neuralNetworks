import Dataset from "./classes/Dataset";
import DatasetItem from "./classes/DatasetItem";


export const doubleInputDataset: Dataset = new Dataset([
  new DatasetItem({
    values: [1],
    desiredOutput: [2]
  }),
  new DatasetItem({
    values: [2],
    desiredOutput: [4]
  }),
  new DatasetItem({
    values: [5],
    desiredOutput: [10]
  }),
])

export const sumDataset: Dataset = new Dataset([
  new DatasetItem({
    values: [1,2],
    desiredOutput: [3]
  }),
  new DatasetItem({
    values: [-1,1],
    desiredOutput: [0]
  }),
  new DatasetItem({
    values: [-3,10],
    desiredOutput: [7]
  }),
  new DatasetItem({
    values: [2,5],
    desiredOutput: [7]
  }),
])

export const averageDataset: Dataset = new Dataset([
  new DatasetItem({
    values: [1,2,3,4],
    desiredOutput: [2.5]
  }),
  new DatasetItem({
    values: [0,-4,4,0],
    desiredOutput: [0]
  }),
  new DatasetItem({
    values: [-2,3,-4,1],
    desiredOutput: [-0.5]
  }),
])

export const onlyPositiveValues: Dataset = new Dataset([
  new DatasetItem({
    values: [-5],
    desiredOutput: [0]
  }),
  new DatasetItem({
    values: [-2],
    desiredOutput: [0]
  }),
  new DatasetItem({
    values: [3],
    desiredOutput: [3]
  }),
  new DatasetItem({
    values: [1],
    desiredOutput: [1]
  }),
])
export const temperatureDataset: Dataset = new Dataset([
  new DatasetItem({
    values: [0],
    desiredOutput: [32]
  }),
  new DatasetItem({
    values: [10],
    desiredOutput: [50]
  }),
  new DatasetItem({
    values: [20],
    desiredOutput: [68]
  }),
  new DatasetItem({
    values: [-10],
    desiredOutput: [14]
  }),
])
export const xorDataset: Dataset = new Dataset([
  new DatasetItem({
    values: [0,0],
    desiredOutput: [0]
  }),
  new DatasetItem({
    values: [1,0],
    desiredOutput: [1]
  }),
  new DatasetItem({
    values: [0,1],
    desiredOutput: [1]
  }),
  new DatasetItem({
    values: [1,1],
    desiredOutput: [0]
  }),
])
