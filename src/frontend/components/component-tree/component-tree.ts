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
  deserializePath,
} from '../../../tree';

import {
  ComponentViewState,
  ExpandState,
} from '../../state';

import {defaultExpansionDepth} from '../node-item/node-item';

@Component({
  selector: 'component-tree',
  templateUrl: './component-tree.html',
  styleUrls: ['./component-tree.css'],
  host: { 'class': 'flex overflow-auto' },
})
export class ComponentTree {
  @Input() tree: MutableTree;
  @Input() private selectedNode: Node;

  @Output() private selectNode = new EventEmitter<Node>();
  @Output() private inspectElement = new EventEmitter<Node>();
  @Output() private expandChildren = new EventEmitter<Node>();
  @Output() private collapseChildren = new EventEmitter<Node>();

  private lastSelection: Element;

  constructor(
    private viewState: ComponentViewState,
    private el: ElementRef
  ) {}

  private scrollToViewIfNeeded() {
    const view = this.el.nativeElement;
    const node = document.getElementsByClassName('node-item-selected').item(0);

    if (node && node !== this.lastSelection) {
      this.lastSelection = node;
      const nodeBound = node.getBoundingClientRect();
      const viewBound = view.getBoundingClientRect();
      const scrollBarHeight = view.offsetHeight - view.clientHeight;
      view.scrollTop += Math.min(0, nodeBound.top - viewBound.top);
      view.scrollTop += Math.max(0, nodeBound.bottom - viewBound.bottom + scrollBarHeight);
    }
  }

  private ngAfterViewChecked() {
    this.scrollToViewIfNeeded();
  }

  private onKeypress(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.navigateUp();
        break;
      case 'ArrowDown':
        this.navigateDown();
        break;
      case 'ArrowLeft':
        this.collapseSelected();
        break;
      case 'ArrowRight':
        this.expandSelected();
        break;
    }

    return true;
  }

  private navigateUp() {
    let previous = this.previousSibling();
    if (previous == null) {
      previous = this.getParent(this.selectedNode);
    }
    this.select(previous);
  }

  private navigateDown() {
    const next = this.nextSibling();
    if (next) {
      this.select(next);
    }
  }

  private collapseSelected() {
    if (this.selectedNode) {
      this.viewState.expandState(this.selectedNode, ExpandState.Collapsed);
    }
  }

  private expandSelected() {
    if (this.selectedNode) {
      this.viewState.expandState(this.selectedNode, ExpandState.Expanded);
    }
  }

  private select(node: Node) {
    if (node == null) { // first keyboard action when nothing is selected
      if (this.tree.roots.length === 0) {
        return;
      }
      node = this.tree.roots[0];
    }

    this.selectNode.emit(node);
  }

  private getParent(node: Node): Node {
    if (node == null) {
      return null;
    }

    const path = deserializePath(node.id);
    path.pop();

    return this.tree.traverse(path);
  }

  private getSibling(node: Node, increment: number): Node {
    const parent = this.getParent(node);
    if (parent == null) {
      return null;
    }

    const index = parent.children.indexOf(node) + increment;
    if (index >= parent.children.length || index < 0) {
      return null;
    }

    return parent.children[index];
  }

  private previousSibling(): Node {
    return this.seekDepth(this.getSibling(this.selectedNode, -1));
  }

  private ancestors(node: Node, increment: number): Array<Node> {
    const nodes = new Array<Node>();
    while (node) {
      nodes.push(this.getSibling(node, increment));
      node = this.getParent(node);
    }
    return nodes;
  }

  private nextSibling(): Node {
    const choices =
      this.visible([this.childNode()].concat(this.ancestors(this.selectedNode, 1)));

    if (choices.length > 0) {
      return choices[0];
    }
    return null;
  }

  private seekDepth(from: Node) {
    if (from == null) {
      return null;
    }

    let flattened = new Array<Node>();

    const apply = (node: Node) => {
      flattened.push(node);

      node.children.forEach(n => apply(n));
    };

    apply(from);

    flattened = this.visible(flattened);

    if (flattened.length > 0) {
      return flattened.pop();
    }

    return null;
  }

  private childNode(): Node {
    if (this.selectedNode == null || this.selectedNode.children.length === 0) {
      return null;
    }
    return this.selectedNode.children[0];
  }

  private level(node: Node): number {
    return deserializePath(node.id).length - 1;
  }

  private visible(nodes: Array<Node>): Array<Node> {
    return nodes.filter(n => {
      if (n == null) {
        return false;
      }

      // NOTE(cbond): parent must be expanded for this node to be visible
      let expansionState = this.viewState.expandState(this.getParent(n));
      if (expansionState == null) {
        expansionState =
          this.level(n) <= defaultExpansionDepth
            ? ExpandState.Expanded
            : ExpandState.Collapsed;
      }
      return expansionState === ExpandState.Expanded;
    });
  }

  private trackById(index: number, node: any): string {
    return node.id;
  }
}
