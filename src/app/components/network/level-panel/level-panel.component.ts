import { NeuralNetworkManagerService } from './../../../services/neural-network-manager.service';
import { levels } from '../../../data/static-datasets/levels';
import { Level } from "./../../../data/static-datasets/Level";
import { Component } from '@angular/core';
import NeuralNetworkPaintHelper from 'src/app/data/paint-helpers/NeuralNetworkPaintHelper';
import { Tags } from 'src/app/data/static-datasets/Tags';

@Component({
  selector: 'app-level-panel',
  templateUrl: './level-panel.component.html',
  styleUrls: ['./level-panel.component.sass']
})
export class LevelPanelComponent {
  // To make property accessible in the template
  levels = levels;
  constructor(private networkManager: NeuralNetworkManagerService){}
  switchToLevel(level: Level){
    this.networkManager.switchLevel(level);
  }
  getColorForTag(tag: Tags){
    return NeuralNetworkPaintHelper.getColorForTag(tag);
  }
}
