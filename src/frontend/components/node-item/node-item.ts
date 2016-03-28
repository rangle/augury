import {Component, Inject, NgZone} from 'angular2/core';
import {NgIf, NgFor, NgStyle} from 'angular2/common';
import * as Rx from 'rxjs';
import {ComponentDataStore}
  from '../../stores/component-data/component-data-store';
import {UserActions} from '../../actions/user-actions/user-actions';
import {UserActionType}
  from '../../actions/action-constants';

@Component({
  selector: 'bt-node-item',
  properties: ['node: node', 'collapsed: collapsed'],
  templateUrl: 'src/frontend/components/node-item/node-item.html',
  directives: [NgIf, NgFor, NodeItem, NgStyle]
})
/**
 * Node Item
 * Renders a node in the Component Tree View
 * (see ../tree-view.ts)
 */
export class NodeItem {

  public node: any;
  private collapsed: any;
  private color: any;
  private borderColor: any;

  constructor(
    private userActions: UserActions,
    private componentDataStore: ComponentDataStore,
    private _ngZone: NgZone
  ) {

    this.borderColor = 'rgba(0, 0, 0, 0.125)';
    this.color = '#666';

    // Listen for changes in selected node
    this.componentDataStore.dataStream
      .filter((data) => {
        return  data.action && data.action === UserActionType.SELECT_NODE &&
          data.selectedNode && data.selectedNode.id;
        })
        .map(({ selectedNode }: any) => selectedNode)
        .subscribe((selectedNode: any) => {
            const isSelected = this.node && selectedNode &&
              selectedNode.id === this.node.id;
            this.update(isSelected);
        });

    this.componentDataStore.dataStream
      .filter((data: any) => {
        return data.action && data.action === UserActionType.OPEN_CLOSE_TREE &&
          data.openedNodes.indexOf(this.node.id) > -1;
      })
      .subscribe((data) => {
        this.node.isOpen = false;
        this._ngZone.run(() => undefined);
      });

    this.componentDataStore.dataStream
      .filter((data: any) => {
        return data.action && data.action === UserActionType.OPEN_CLOSE_TREE &&
          data.selectedNode.id === this.node.id;
      })
      .subscribe((data) => {
        this.userActions.selectNode({ node: this.node });
      });
  }

  /**
   * Update the state of the node based on selection
   * @param  {Boolean} isSelected
   */
  update(isSelected) {
    this.node.isSelected = isSelected;
    this.borderColor = this.node.isSelected ? '#0074D9' :
      'rgba(0, 0, 0, 0.125)';
    this.color = this.node.isSelected ? '#222' : '#888';
    this._ngZone.run(() => undefined);
  }

  getNodeDetails(node) {

    let html = '';
    html += '<p class="node-item-name">' + node.name + '</p>';
    if (node.description && node.description.length) {
      html += '<span class="node-item-description">( ';
      for (let i = 0; i < node.description.length; i++) {
        const desc = node.description[i];
        html += '<p class="node-item-property">' + desc.key + '=</p>';
        html += '<p class="node-item-value">"' + desc.value + '"</p>';
        if (i < node.description.length - 1) {
          html += '<span>, </span>';
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
    let evalStr = 'inspect($$(\'body [batarangle-id=\"' +
      this.node.id + '\"]\')[0])';

    chrome.devtools.inspectedWindow.eval(
      evalStr,
      function(result, isException) {
        console.log(result, isException);
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
    this._ngZone.run(() => undefined);
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
    $event.preventDefault();
    $event.stopPropagation();
  }

}
