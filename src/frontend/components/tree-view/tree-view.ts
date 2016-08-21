import {Component, Input, EventEmitter, Output} from '@angular/core';

import {NodeItem} from '../node-item/node-item';
import {ComponentTree} from '../component-tree/component-tree';

@Component({
  selector: 'bt-tree-view',
  template: require('./tree-view.html'),
  directives: [NodeItem, ComponentTree]
})
export class TreeView {
  @Input() tree: Array<any>;
  @Input() changedNodes: Array<any>;
  @Input() selectedNode: any;
  @Input() closedNodes: Array<any>;

  @Output() private selectionChange = new EventEmitter<Node>();
}
