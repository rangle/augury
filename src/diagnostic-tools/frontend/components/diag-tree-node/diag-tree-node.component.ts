// third party deps
import { Component, Input } from '@angular/core';

// same-module deps
import { PacketTreeNode } from 'diagnostic-tools/frontend/state.model';

@Component({
  selector: 'bt-diag-tree-node',
  template: require('./diag-tree-node.component.html'),
  styles: [
    require('to-string!./diag-tree-node.component.css'),
  ],
})
export class DiagTreeNodeComponent {

  @Input('node') node: PacketTreeNode;

  objectKeys = Object.keys; // use in template

  constructor() { }

}
