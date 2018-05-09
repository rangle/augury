// third party deps
import { Component, Input } from '@angular/core';

// same-module deps
import { PacketTreeNode, PresentationOptions } from 'diagnostic-tools/frontend/state.model';
import { DiagType } from 'diagnostic-tools/shared/DiagPacket.class';

@Component({
  selector: 'bt-diag-tree-node',
  template: require('./diag-tree-node.component.html'),
  styles: [
    require('to-string!./diag-tree-node.component.css'),
  ],
})
export class DiagTreeNodeComponent {

  DiagType = DiagType;
  objectKeys = Object.keys;

  @Input('expanded') expanded: boolean = false;
  @Input('node') node: PacketTreeNode;
  @Input('opts') opts: { showPassed: boolean };

  public toggleExpanded() {
    this.expanded = !this.expanded
  }

  constructor() { }

}
