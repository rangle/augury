import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import {Node} from '../../../tree/node';
import {UserActions} from '../../actions/user-actions/user-actions';

import {
  ExpandState,
  ComponentViewState,
} from '../../state';

/// The number of levels of tree nodes that we expand by default
export const defaultExpansionDepth = 3;

@Component({
  selector: 'bt-node-item',
  templateUrl: './node-item.html',
  styleUrls: ['./node-item.css'],
})
export class NodeItem {
  @Input() node;

  // The depth of this node in the tree
  @Input() level: number;

  // Emitted when this node is selected
  @Output() private selectNode = new EventEmitter<Node>();

  // Emitted when this node is selected for element inspection
  @Output() private inspectElement = new EventEmitter<Node>();

  // Expand this node and all its children
  @Output() private expandChildren = new EventEmitter<Node>();

  // Collapse this node and all its children
  @Output() private collapseChildren = new EventEmitter<Node>();

  constructor(
    private changeDetector: ChangeDetectorRef,
    public viewState: ComponentViewState,
    private userActions: UserActions
  ) {}

  get selected(): boolean {
    return this.viewState.selectionState(this.node);
  }

  get expanded(): boolean {
    const state = this.viewState.expandState(this.node);
    if (state == null) { // user has not expanded or collapsed explicitly
      return this.defaultExpanded;
    }
    return state === ExpandState.Expanded;
  }

  private get defaultExpanded(): boolean {
    return this.level < defaultExpansionDepth;
  }

  get hasChildren(): boolean {
    return this.node.children.length > 0;
  }

  /// Select the element in inspect window on double click
  onDblClick(event: MouseEvent) {
    this.inspectElement.emit(this.node);
  }

  onClick(event: MouseEvent) {
    if (event.ctrlKey || event.metaKey) {
      this.expandChildren.emit(this.node);
    }
    else if (event.altKey) {
      this.collapseChildren.emit(this.node);
    }

    this.selectNode.emit(this.node);
  }

  onMouseOut(event: MouseEvent) {
    this.userActions.clearHighlight();
  }

  onMouseOver($event) {
    this.userActions.highlight(this.node);
  }

  onToggleExpand($event) {
    const defaultState =
      this.defaultExpanded
        ? ExpandState.Expanded
        : ExpandState.Collapsed;

    this.userActions.toggle(this.node, defaultState);

    this.changeDetector.detectChanges();
  }

  trackById = (index: number, node: Node) => node.id;
}
