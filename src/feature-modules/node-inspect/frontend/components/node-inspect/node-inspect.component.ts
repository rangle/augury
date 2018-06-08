import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { select } from '@angular-redux/store';

import { NodeInspectService } from '../../service';
import { NodeInspectSelectors as Selectors } from '../../state.model';

@Component({
  selector: 'bt-node-inspect',
  templateUrl: './node-inspect.component.html',
  styleUrls: ['./node-inspect.component.css'],
  host: { 'class': 'flex overflow-auto' },
})
export class NodeInspectComponent {

  @Input() selectedNode: Node;

  @select(Selectors.examples) examples;

  constructor(
    private _nodeStateService: NodeInspectService
  ) {}

  inspect(){
    this._nodeStateService.inspectNode([0, 4, 0, 0])
  }

  addExample(){
    this._nodeStateService.addExample()
  }

  selectProp(key){
    this._nodeStateService.getPropsAtPath(key)
  }
}
