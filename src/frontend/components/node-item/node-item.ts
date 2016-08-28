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

  /// Emitted when this node is selected
  @Output() private selectionChange = new EventEmitter<Node>();

  /// Emitted when this node is selected for element inspection
  @Output() private inspectElement = new EventEmitter<Node>();

  constructor(
    private viewState: ViewState,
    private userActions: UserActions
  ) {}

  private get selected(): boolean {
    return this.viewState.selectionState(this.node);
  }

  private get expanded(): boolean {
    return this.viewState.expandState(this.node) === ExpandState.Expanded;
  }

  private hovered = false;

  private get hasChildren(): boolean {
    return this.node.children.length > 0;
  }

  /// Prevent propagation of mouse events so that parent handlers are not invoked
  private stop(event: MouseEvent, handler: (event: MouseEvent) => void) {
    try {
      handler.bind(this)(event);
    }
    finally {
      event.stopImmediatePropagation();
      event.stopPropagation();
      event.preventDefault();
    }
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
    this.hovered = false;
  }

  onMouseOver($event) {
    this.userActions.highlight(this.node);
    this.hovered = true;
  }

  expandTree($event) {
    this.userActions.toggle(this.node);
  }

  trackById = (index: number, node: Node) => node.id;
}

const stop = (event: MouseEvent) => {
  event.preventDefault();
  event.stopPropagation();
};

