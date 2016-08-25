///<amd-dependency path="../../../tree/node" />

import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  NgZone,
  Input,
  Output,
} from '@angular/core';

import {Highlightable} from '../highlightable';
import {UserActions} from '../../actions/user-actions/user-actions';
import {Node} from '../../../tree/node';

import {
  ExpandState,
  ViewState,
} from '../../state';

@Component({
  selector: 'bt-node-item',
  template: require('./node-item.html'),
  directives: [
    NodeItem,
  ]
})
export class NodeItem extends Highlightable {
  @Input() node;

  /// Emitted when this node is selected
  @Output() private selectionChange = new EventEmitter<Node>();

  /// Emitted when this node is selected for element inspection
  @Output() private inspectElement = new EventEmitter<Node>();

  constructor(
    private changeDetector: ChangeDetectorRef,
    private viewState: ViewState,
    private userActions: UserActions
  ) {
    super(changeDetector, () => viewState.nodeIsChanged(this.node));
  }

  private ngDoCheck() {
    if (this.viewState.nodeIsChanged(this.node)) {
      this.changed();
    }
  }

  getNodeDetails(node) {
    let html = '';
    html += `<p class="node-item-name">${node.name}</p>`;
    if (node.description && node.description.length) {
      html += '<span class="node-item-description">(';
      for (let i = 0; i < node.description.length; i++) {
        const desc = node.description[i];
        html += `<p class="node-item-property">${desc.key}=</p>` +
                `<p class="node-item-value">&#34;${desc.value}&#34;</p>`;
        if (i < node.description.length - 1) {
          html += ', ';
        }
      }
      html += ')</span>';
    }

    return html;
  }

  private get selected(): boolean {
    return this.viewState.selectionState(this.node);
  }

  private get expanded(): boolean {
    return this.viewState.expandState(this.node) === ExpandState.Expanded;
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
  }

  onMouseOver($event) {
    this.userActions.highlight(this.node);
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

