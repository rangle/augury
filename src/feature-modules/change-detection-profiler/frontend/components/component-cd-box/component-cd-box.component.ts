import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { select } from '@angular-redux/store';

import { ChangeDetectionProfilerService } from '../../service';
import { ChangeDetectionProfilerSelectors as Selectors } from '../../state.model';

@Component({
  selector: 'bt-component-cd-box',
  templateUrl: './component-cd-box.component.html',
  styleUrls: ['./component-cd-box.component.css'],
  host: { 'class': 'flex overflow-auto' },
})
export class ComponentChangeDetectionBoxComponent {

  @Input('selected-node') selectedNode;
  @select(Selectors.ticks) ticks;

  constructor(
    private _nodeStateService: ChangeDetectionProfilerService
  ) {
    this.ticks.subscribe((...args) => console.log(args))
  }

  componentCheckedThisTick(tick){
    if (!this.selectedNode || !this.selectedNode.isComponent) return false;
    return !!tick.nodesChecked[this.selectedNode.id]
  }

  metricsForThisComponent(tick) {
    if (!this.selectedNode || !this.selectedNode.isComponent) return;
    return tick.nodesChecked[this.selectedNode.id]
  }

}
