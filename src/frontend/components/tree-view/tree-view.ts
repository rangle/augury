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
  @Input() private tree: MutableTree;
  @Input() private selectedNode: Node;

  @Output() private selectionChange = new EventEmitter<Node>();
  @Output() private inspectElement = new EventEmitter<Node>();
  @Output() private expandChildren = new EventEmitter<Node>();
  @Output() private collapseChildren = new EventEmitter<Node>();
}
