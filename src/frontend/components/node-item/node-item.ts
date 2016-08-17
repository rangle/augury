import {
  ChangeDetectorRef,
  Component,
  NgZone,
  Input,
} from '@angular/core';
import {NgIf, NgFor} from '@angular/common';

import {
  ComponentDataStore
} from '../../stores/component-data/component-data-store';
import {Highlightable} from '../highlightable';
import {UserActions} from '../../actions/user-actions/user-actions';

@Component({
  selector: 'bt-node-item',
  template: require('./node-item.html'),
  directives: [NgIf, NgFor, NodeItem]
})

/**
 * Node Item
 * Renders a node in the Component Tree View
 * (see ../tree-view.ts)
 */
export class NodeItem extends Highlightable {
  @Input() node: any;
  @Input() changedNodes: any;
  @Input() selectedNode: any;
  @Input() closedNodes: Array<any>;
  @Input() allowedComponentTreeDepth: number;

  private collapsed: any;
  private isSelected: boolean = false;

  // Perf: if the node was already rendered keep it in the component tree
  // even if it is hidden.
  private wasRendered: boolean = false;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private userActions: UserActions,
    private componentDataStore: ComponentDataStore
  ) {
    super(changeDetector, () => this.changedNodes.indexOf(this.node.id) > 0);
  }

  ngOnInit() {
    // if the tree is too deep stop opening and rendering the tree.
    this.node.isOpen = this.isDepthLimitReached() ? false : this.node.isOpen;

    // the deeper the rendering goes, the closer the rendering comes to
    // reaching the limit. Pass this value recursively to sub nodes.
    this.allowedComponentTreeDepth -= 1;
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  // Return true if the component tree should no longer be opening
  // its nodes by default, if false keep expanding the tree.
  isDepthLimitReached(): boolean {
    return this.allowedComponentTreeDepth <= 0 && !this.node.overrideDepthLimit;
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

  /**
   * Select the element in inspect window on double click
   * @param  {Object} $event
   */
  onDblClick($event) {
    const evalStr = `inspect($$('body [augury-id="${this.node.id}"]\')[0])`;

    chrome.devtools.inspectedWindow.eval(
      evalStr,
      function(result, isException) {
        if (isException) {
          console.log(isException);
        }
      }
    );

    $event.preventDefault();
    $event.stopPropagation();
  }

  /**
   * Select this node on click
   * @param  {Object} $event
   */
  onClick($event) {
    this.userActions.selectNode({ node: this.node });
    $event.preventDefault();
    $event.stopPropagation();
  }

  /**
   * Dispatch clear highlight action on node mouse out
   * @param  {Object} $event
   */
  onMouseOut($event) {
    $event.preventDefault();
    $event.stopPropagation();
    this.userActions.clearHighlight();
  }

  /**
   * Dispatch element highlight action on node mouse over
   * @param  {Object} $event
   */
  onMouseOver($event) {
    this.userActions.highlight({ node: this.node });
    $event.preventDefault();
    $event.stopPropagation();
  }

  showChildren() {
    return !this.node.isOpen;
  }

  /**
   * Expand or Collapse tree based on current state on click
   * @param  {Object} $event
   */
  expandTree($event) {
    this.node.isOpen = !this.node.isOpen;
    this.userActions.openCloseNode({ node: this.node });

    // if the disclosure arrow on the component node was clicked
    // it was rendered.
    this.wasRendered = true;
    $event.preventDefault();
    $event.stopPropagation();
  }

  ngOnChanges(changes) {
    super.ngOnChanges(changes);

    if (this.selectedNode && this.node) {
      this.isSelected = (this.selectedNode.id === this.node.id);
    }

    if (this.closedNodes && this.node) {
      if (this.closedNodes.indexOf(this.node.id) > -1) {
        this.node.isOpen = false;
      }
    }

    this.changedNodes.splice(0, this.changedNodes.length);
  }

  trackById(index: number, node: any): string {
    return node.id;
  }
}
