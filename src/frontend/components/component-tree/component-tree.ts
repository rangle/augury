import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import {
  MutableTree,
  Node,
} from '../../../tree';

@Component({
  selector: 'component-tree',
  template: require('./component-tree.html'),
  styles: [require('to-string!./component-tree.css')],
  host: {'class': 'flex overflow-auto'},
})
export class ComponentTree {
  @Input() tree: MutableTree;

  @Output() private selectionChange = new EventEmitter<Node>();
  @Output() private inspectElement = new EventEmitter<Node>();
  @Output() private expandChildren = new EventEmitter<Node>();
  @Output() private collapseChildren = new EventEmitter<Node>();

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
}
