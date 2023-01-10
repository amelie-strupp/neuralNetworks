import { ActivationFunction } from './../math-helpers/ActivationFunction';
import { Color } from "../values/Colors";
import ColorHelper from "./ColorHelper";
import { Tags } from '../static-datasets/Tags';

export default class NeuralNetworkPaintHelper{

  // Returns a shade of blue/red/white depending on how negative/positive the value is
  static getColorFromValue(d: {value: number, min?: number, max?: number}){
    let min = d.min ?? -2;
    let max = d.max ?? 2;
    let brightnessPercentage = 0;
    let color: Color|string = Color.white;
    if(d.value > 0){
      brightnessPercentage = d.value/max;
      color = "#fc0558"
    }else if(d.value < 0){
      brightnessPercentage = d.value/min;
      color = Color.blue;
    }
    // If it is larger than the max/min, just give it the maximum darkness and then stop
    // There is a problem if the brightness percentage is exactly one (it returns black) -> This is the reason for 0.99
    brightnessPercentage = brightnessPercentage >= 1 ? 0.99 : brightnessPercentage;
    let backgroundColor = ColorHelper.increaseBrightness({color: color, percent: 99 - brightnessPercentage*100})
    let textColor = Color.blackBlue;
    // Depending on the brightness, the function also recommends a suitable text color
    if(brightnessPercentage > 0.4){
      textColor = Color.white;
    }
    return {
      backgroundColor: backgroundColor,
      textColor: textColor}
  }
  static getWidthFromValue(d: {value: number, min?: number, max?: number,
    maximumWidth?: number,
    minimumWidth?: number}){
    let min = d.min ?? -2;
    let max = d.max ?? 2;
    let minimumWidth = d.minimumWidth ?? 8;
    let maximumWidth = d.maximumWidth ?? 20;
    let widthPercentage = 0;
    if(d.value > 0){
      widthPercentage = d.value/max;
    }else if(d.value < 0){
      widthPercentage = d.value/min;
    }
    widthPercentage = widthPercentage > 1 ? 1 : widthPercentage;
    return minimumWidth + maximumWidth*widthPercentage;
  }
  static getColorForActivationFunction(f: ActivationFunction){
    switch(f){
    case ActivationFunction.identity:
      return 'var(--red)';
    case ActivationFunction.relu:
      return 'var(--yellow)';
    case ActivationFunction.tanh:
      return 'var(--green)';
    case ActivationFunction.sigmoid:
      return 'var(--purple)';
    }
  }
  static getColorForTag(tag: Tags){
    switch(tag){
      case Tags.biases:
        return 'var(--yellow)';
      case Tags.weights:
        return 'var(--azul)';
      case Tags.activationFunctions:
        return 'var(--red)';
      }
  }
}
