import {Component, Input} from '@angular/core';
import {NgFor} from '@angular/common';
import {NodeItem} from '../node-item/node-item';
import {ComponentTree} from '../component-tree/component-tree';

@Component({
  selector: 'bt-tree-view',
  template: require('./tree-view.html'),
  directives: [NgFor, NodeItem, ComponentTree]
})
/**
 * The Tree View
 * Displays the components' hierarchy
 */
export class TreeView {
  @Input() tree: any;
  @Input() changedNodes: any;
  @Input() selectedNode: any;
  @Input() closedNodes: Array<any>;
  @Input() allowedComponentTreeDepth: number;
}
