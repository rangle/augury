import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import {
  MutableTree,
  Node,
} from '../../../tree';

@Component({
  selector: 'bt-tree-view',
  template: require('./tree-view.html'),
})
export class TreeView {
  @Input() tree: MutableTree;

  @Output() private selectionChange = new EventEmitter<Node>();
  @Output() private inspectElement = new EventEmitter<Node>();
}
