import {Component} from '@angular/core';
import {NgFor} from '@angular/common';
import {NodeItem} from '../node-item/node-item';
import {ComponentTree} from '../component-tree/component-tree';

@Component({
  selector: 'bt-tree-view',
  inputs: ['tree', 'changedNodes', 'selectedNode', 'closedNodes'],
  templateUrl: 'src/frontend/components/tree-view/tree-view.html',
  directives: [NgFor, NodeItem, ComponentTree]
})
/**
 * The Tree View
 * Displays the components' hierarchy
 */
export class TreeView {}
