import {Component, View, Inject, NgZone} from 'angular2/core';
import {NgIf, NgFor, NgStyle} from 'angular2/common';
import {ComponentDataStore}
  from '../../stores/component-data/component-data-store';
import {UserActions} from '../../actions/user-actions/user-actions';

@Component({
  selector: 'bt-node-item',
  properties: ['node: node', 'collapsed: collapsed']
})
@View({
  templateUrl: 'components/node-item/node-item.html',
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
  private isSelected: boolean;
  private showChildren: boolean = true;

  constructor(
    private userActions: UserActions,
    private componentDataStore: ComponentDataStore,
    private _ngZone: NgZone
  ) {

    this.borderColor = 'rgba(0, 0, 0, 0.125)';
    this.color = '#666';

    // Listen for changes in selected node
    this.componentDataStore.dataStream
      .map(({ selectedNode }: any) => selectedNode)
      .filter((selectedNode: any) => selectedNode && selectedNode.id)
      .subscribe((selectedNode: any) => {
        const isSelected = this.node && selectedNode &&
          selectedNode.id === this.node.id;
        this.update(isSelected);
      });

  }

  /**
   * Update the state of the node based on selection
   * @param  {Boolean} isSelected
   */
  update(isSelected) {
    this.isSelected = isSelected;
    this.borderColor = isSelected ? '#0074D9' :
      'rgba(0, 0, 0, 0.125)';
    this.color = isSelected ? '#222' : '#888';
  }

  /**
   * Select this node on click
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

  onClick($event) {
    this.userActions.selectNode({ node: this.node });
    this._ngZone.run(() => undefined);
    $event.stopPropagation();
  }

  expandTree($event) {
    this.showChildren = !this.showChildren;
    $event.preventDefault();
    $event.stopPropagation();
  }

}
