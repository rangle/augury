import {Component, View, Inject, NgZone} from 'angular2/core';
import {NgFor} from 'angular2/common';
import {NodeItem} from '../node-item/node-item';
import {InfoPanel} from '../info-panel/info-panel';
import {UserActions} from '../../actions/user-actions/user-actions';

@Component({
  selector: 'bt-tree-view',
  properties: ['tree: tree']
})
@View({
  templateUrl: 'src/frontend/components/tree-view/tree-view.html',
  directives: [NgFor, NodeItem, InfoPanel]
})
/**
 * The Tree View
 * Displays the components' hierarchy
 */
export class TreeView {

  private tree: any;
  constructor(
    private userActions: UserActions,
    private _ngZone: NgZone
  ) {
  }

  /**
   * Query for a node
   * @param  {String} query
   */
  onChange(query) {
    query = query.toLocaleLowerCase();
    this.userActions.searchNode({ query });
    this._ngZone.run(() => undefined);
  }

}
