import {Component, Input, EventEmitter, Output} from '@angular/core';

import {NodeItem} from '../node-item/node-item';
import {ComponentTree} from '../component-tree/component-tree';
import {MutableTree} from '../../../tree';

@Component({
  selector: 'bt-tree-view',
  template: require('./tree-view.html'),
  directives: [NodeItem, ComponentTree]
})
export class TreeView {
  @Input() tree: MutableTree;
  @Input() changedNodes: Array<any>;
  @Input() selectedNode: any;
  @Input() closedNodes: Array<any>;

  @Output() private selectionChange = new EventEmitter<Node>();

  @Output() private inspectElement = new EventEmitter<Node>();
}
