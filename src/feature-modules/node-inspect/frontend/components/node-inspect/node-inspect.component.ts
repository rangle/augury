import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { NodeInspectService } from '../../service';

@Component({
  selector: 'bt-node-inspect',
  templateUrl: './node-inspect.component.html',
  styleUrls: ['./node-inspect.component.css'],
  host: { 'class': 'flex overflow-auto' },
})
export class NodeInspectComponent {

  @Input() selectedNode: Node;

  constructor(
    private _nodeStateService: NodeInspectService
  ) {}

  doThing(){
    this._nodeStateService.inspectNode([0, 4, 0, 0])
  }
}
