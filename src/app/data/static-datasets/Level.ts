import { NeuralNetworkOptions } from '../models/neural_network/NeuralNetwork';
import Dataset from './classes/Dataset';
import { ErrorLevel } from './ErrorLevels';
import { Tags } from './Tags';


export class Level {
  title: string;
  subtitle: string;
  description: string;
  tags: Array<Tags> = [];
  dataset: Dataset;
  initialNetworkConfiguration: NeuralNetworkOptions;
  validValueConfiguration: {
    maxWeight: number;
    minWeight: number;
    maxBias: number;
    minBias: number;
    biasStepSize: number,
    weightStepSize: number;
  } = {
      maxWeight: 2,
      minWeight: -2,
      maxBias: 2,
      minBias: -2,
      biasStepSize: 0.25,
      weightStepSize: 0.25
    };
  MSEErrorLevels = {
    lowErrorBound: 1,
    mediumErrorBound: 5,
    highErrorBound: 10,
  };
  singleItemErrorLevels = {
    lowErrorBound: 1,
    mediumErrorBound: 2,
    highErrorBound: 3,
  };
  successBound: number = 0;
  constructor(d: {
    title: string;
    subtitle: string;
    description: string;
    dataset: Dataset;
    networkConfiguration: NeuralNetworkOptions;
    maxWeight?: number;
    minWeight?: number;
    maxBias?: number;
    minBias?: number;
    stepSize?: number;
    biasStepSize?: number;
    weightStepSize?: number;

    MSEErrorLevels?: {
      lowErrorBound: number;
      mediumErrorBound: number;
      highErrorBound: number;
    };
    singleItemErrorLevels?: {
      lowErrorBound: number;
      mediumErrorBound: number;
      highErrorBound: number;
    };
    tags?: Array<Tags>;
    successBound?: number;
  }) {
    this.dataset = d.dataset;
    this.initialNetworkConfiguration = d.networkConfiguration;
    this.validValueConfiguration = {
      maxWeight: d.maxWeight ?? this.validValueConfiguration.maxWeight,
      minWeight: d.minWeight ?? this.validValueConfiguration.minWeight,
      maxBias: d.maxBias ?? this.validValueConfiguration.maxBias,
      minBias: d.minBias ?? this.validValueConfiguration.minBias,
      biasStepSize: d.biasStepSize ?? d.stepSize ??  this.validValueConfiguration.biasStepSize,
      weightStepSize: d.weightStepSize ?? d.stepSize ??  this.validValueConfiguration.weightStepSize,

    };
    this.MSEErrorLevels = d.MSEErrorLevels ?? this.MSEErrorLevels;
    this.singleItemErrorLevels =
      d.singleItemErrorLevels ?? this.singleItemErrorLevels;
    this.title = d.title;
    this.subtitle = d.subtitle;
    this.description = d.description;
    this.tags = d.tags ?? this.tags;
    this.successBound = d.successBound ?? this.successBound;
  }
  getMSEErrorLevel(error: number) {
    // Which fraction of the high error the current error is
    // Will be bounded by one
    // This information might be useful for the display of the error
    let percentageOfHighErrorBound = error / this.MSEErrorLevels.highErrorBound;
    percentageOfHighErrorBound =
      percentageOfHighErrorBound > 1 ? 1 : percentageOfHighErrorBound;
    if (error < this.MSEErrorLevels.lowErrorBound) {
      return {
        level: ErrorLevel.low,
        percentageOfHighErrorBound: percentageOfHighErrorBound,
      };
    } else if (error < this.MSEErrorLevels.mediumErrorBound) {
      return {
        level: ErrorLevel.medium,
        percentageOfHighErrorBound: percentageOfHighErrorBound,
      };
    } else {
      return {
        level: ErrorLevel.high,
        percentageOfHighErrorBound: percentageOfHighErrorBound,
      };
    }
  }
  getSingleItemErrorLevel(error: number) {
    if (error < this.MSEErrorLevels.lowErrorBound) {
      return ErrorLevel.low;
    } else if (error < this.MSEErrorLevels.mediumErrorBound) {
      return ErrorLevel.medium;
    } else {
      return ErrorLevel.high;
    }
  }
}
