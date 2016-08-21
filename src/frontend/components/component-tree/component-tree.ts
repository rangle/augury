import {
  Component,
  ElementRef,
  Input,
  EventEmitter,
  Output,
} from '@angular/core';

import {NodeItem} from '../node-item/node-item';
import {Node} from '../../../tree';

@Component({
  selector: 'component-tree',
  template: require('./component-tree.html'),
  host: {'class': 'flex overflow-scroll'},
  directives: [NodeItem]
})
export class ComponentTree {
  @Input() tree: Array<Node>;
  @Input() changedNodes: Array<Node>;
  @Input() selectedNode;
  @Input() closedNodes: Array<any>;

  @Output() private selectionChange = new EventEmitter<Node>();

  private prevSelectedNode: Element;

  constructor(
    private el: ElementRef
  ) {}

  scrollToViewIfNeeded(node) {
    const selectedNodeBound = node.getBoundingClientRect();
    const treeViewBound = this.el.nativeElement.getBoundingClientRect();
    const scrollBarHeight = this.el.nativeElement.offsetHeight -
      this.el.nativeElement.clientHeight;
    const topOffset = selectedNodeBound.top - treeViewBound.top;
    const bottomOffset = selectedNodeBound.bottom - treeViewBound.bottom +
      scrollBarHeight;

    if (topOffset < 0) {              // node is too high
      this.el.nativeElement.scrollTop += topOffset;
    } else if (bottomOffset > 0) {    // node is too low
      this.el.nativeElement.scrollTop += bottomOffset;
    }
  }

  ngAfterViewChecked() {
    const selectedNode = document.getElementsByClassName('node-item-selected')
                         .item(0);
    if (selectedNode && this.prevSelectedNode !== selectedNode) {
      this.scrollToViewIfNeeded(selectedNode);
      this.prevSelectedNode = selectedNode;
    }
  }

  trackById(index: number, node: any): string {
    return node.id;
  }

  private onSelectionChange(node: Node) {
    this.selectionChange.emit(node);
  }
}
