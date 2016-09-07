///<amd-dependency path="../../../tree/node" />

import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  NgZone,
  Input,
  Output,
} from '@angular/core';

import {UserActions} from '../../actions/user-actions/user-actions';
import {Node} from '../../../tree/node';

import {
  ExpandState,
  ViewState,
} from '../../state';

import {NodeAttributes} from './node-attributes';
import {NodeOpenTag} from './node-open-tag';

/// The number of levels of tree nodes that we expand by default
const defaultExpansionDepth = 3;

@Component({
  selector: 'bt-node-item',
  template: require('./node-item.html'),
  directives: [
    NodeAttributes,
    NodeOpenTag,
    NodeItem,
  ],
  styles: [require('to-string!./node-item.css')],
})
export class NodeItem {
  @Input() node;

  // The depth of this node in the tree
  @Input() level: number;

  /// Emitted when this node is selected
  @Output() private selectionChange = new EventEmitter<Node>();

  /// Emitted when this node is selected for element inspection
  @Output() private inspectElement = new EventEmitter<Node>();

  constructor(
    private changeDetector: ChangeDetectorRef,
    private viewState: ViewState,
    private userActions: UserActions
  ) {}

  private get selected(): boolean {
    return this.viewState.selectionState(this.node);
  }

  private get expanded(): boolean {
    const state = this.viewState.expandState(this.node);
    if (state == null) { // user has not expanded or collapsed explicitly
      return this.defaultExpanded;
    }
    return state === ExpandState.Expanded;
  }

  private get defaultExpanded(): boolean {
    return this.level < defaultExpansionDepth;
  }

  private get hasChildren(): boolean {
    return this.node.children.length > 0;
  }

  /// Select the element in inspect window on double click
  onDblClick(event: MouseEvent) {
    this.inspectElement.emit(this.node);
  }

  onClick(event: MouseEvent) {
    this.selectionChange.emit(this.node);
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
