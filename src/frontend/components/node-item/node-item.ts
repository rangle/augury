import {
  ChangeDetectorRef,
  Component,
  NgZone,
  Input,
} from '@angular/core';

import {Highlightable} from '../highlightable';
import {UserActions} from '../../actions/user-actions/user-actions';
import {Node} from '../../../tree';

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
  @Input() node: any;
  @Input() changedNodes: any[];
  @Input() selectedNode: any;
  @Input() closedNodes: Array<any>;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private viewState: ViewState,
    private userActions: UserActions
  ) {
    super(changeDetector, () => this.changedNodes.indexOf(this.node.id) > 0);
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
    const evalStr = `inspect($$('body [augury-id="${this.node.id}"]\')[0])`;

    chrome.devtools.inspectedWindow.eval(
      evalStr,
      function(result, isException) {
        if (isException) {
          console.log(isException);
        }
      }
    );
  }

  onClick(event: MouseEvent) {
    this.userActions.selectComponent(this.node);
  }

  onMouseOut(event: MouseEvent) {
    this.userActions.clearHighlight();
  }

  onMouseOver($event) {
    this.userActions.highlight(this.node);
  }

  expandTree($event) {
    this.node.isOpen = !this.node.isOpen;

    this.userActions.toggle(this.node);
  }

  ngOnChanges(changes) {
    super.ngOnChanges(changes);
  }

  trackById = (index: number, node: Node) => node.id;
}

const stop = (event: MouseEvent) => {
  event.preventDefault();
  event.stopPropagation();
}