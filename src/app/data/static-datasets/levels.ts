import { ActivationFunction } from '../math-helpers/ActivationFunction';
import Matrix from '../math-helpers/Matrix';
import {
  averageDataset,
  doubleInputDataset,
  onlyPositiveValues,
  sumDataset,
  temperatureDataset,
  xorDataset,
} from './datasets';
import { Level } from './Level';
import { Tags } from './Tags';

export const levels: Array<{ categoryName: string; levels: Array<Level> }> = [
  {
    categoryName: 'Basic Functions',

    levels: [
      // Double the input
      new Level({
        title: 'Double the input',
        subtitle: 'Can you adjust the network such that it doubles the input?',
        description:
          'Can you adjust the weights and biases in a way, that the input is doubled?',
        tags: [Tags.weights],
        dataset: doubleInputDataset,
        minWeight: -3,
        maxWeight: 3,
        minBias: -3,
        maxBias: 3,
        stepSize: 0.5,
        networkConfiguration: {
          layerOptions: [
            {
              numberOfNeurons: 1,
            },
            {
              numberOfNeurons: 1,
            },
          ],
        },
      }),

      // Compute the sum
      new Level({
        title: 'Compute the sum',
        subtitle: 'Try to adjust the weights to compute the sum',
        description: 'Try to adjust the weights to compute the sum',
        tags: [Tags.weights],
        dataset: sumDataset,
        minWeight: -3,
        maxWeight: 3,
        minBias: -3,
        maxBias: 3,
        stepSize: 0.5,
        networkConfiguration: {
          layerOptions: [
            {
              numberOfNeurons: 2,
            },
            {
              numberOfNeurons: 1,
              initialWeightMatrix: new Matrix([[0.5], [0.5]]),
            },
          ],
        },
      }),

      // Compute the average
      new Level({
        title: 'Compute the average',
        description: 'Try to adjust the weights to compute the average',
        subtitle: 'Try to adjust the weights to compute the average',
        dataset: averageDataset,
        tags: [Tags.weights],

        minWeight: -4,
        maxWeight: 4,
        minBias: -4,
        maxBias: 4,
        stepSize: 0.25,
        networkConfiguration: {
          layerOptions: [
            {
              numberOfNeurons: 4,
            },
            {
              numberOfNeurons: 1,
            },
          ],
        },
      }),

      // Only positive values
      new Level({
        title: 'Propagate only positive values',
        description:
          'Try to design a network that leaves positive numbers unchanged, but discards negative values',
        subtitle: 'Use an activation function to keep only the positive values',
        dataset: onlyPositiveValues,
        tags: [Tags.weights, Tags.activationFunctions],
        minWeight: -2,
        maxWeight: 2,
        minBias: -2,
        maxBias: 2,
        stepSize: 0.25,
        networkConfiguration: {
          layerOptions: [
            {
              numberOfNeurons: 1,
            },
            {
              numberOfNeurons: 1,
            },
          ],
        },
      }),

      // Celsius to Fahrenheit
      new Level({
        title: 'Celsius to Fahrenheit',
        description:
          'Given a temperature in Celsius - compute the temperature in Fahrenheit. (Hint - The formula is (x°C * 1.8 + 32) = x°F.)',
        subtitle:
          'Given a temperature in Celsius - can you design a network that converts it to Fahrenheit?',
        dataset: temperatureDataset,
        tags: [Tags.weights, Tags.biases],
        minWeight: -3,
        maxWeight: 3,
        minBias: -50,
        maxBias: 50,
        biasStepSize: 1,
        weightStepSize: 0.2,
        networkConfiguration: {
          layerOptions: [
            {
              numberOfNeurons: 1,
            },
            {
              numberOfNeurons: 1,
            },
            {
              numberOfNeurons: 1,
            },
          ],
        },
      }),

      // XOR
      new Level({
        title: 'Compute XOR',
        description:
          'Design a network that can compute a simple XOR-Gate.',
        subtitle:
          'Can you design a network that can compute the XOR-Function?',
        dataset: xorDataset,
        tags: [Tags.weights, Tags.biases, Tags.activationFunctions],
        minWeight: -3,
        maxWeight: 3,
        minBias: -3,
        maxBias: 3,
        biasStepSize: 1,
        weightStepSize: 0.5,
        networkConfiguration: {
          layerOptions: [
            {
              numberOfNeurons: 2,
            },
            {
              numberOfNeurons: 3,
            },
            {
              numberOfNeurons: 1,
            },
          ],
        },
      }),
    ],
  },
];
