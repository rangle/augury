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
  templateUrl: 'components/tree-view/tree-view.html',
  directives: [NgFor, NodeItem, InfoPanel]
})
/**
 * The Tree View
 * Displays the components' hierarchy
 */
export class TreeView {

  private tree: any;
  private _searchIndex: number = 1;

  constructor(
    private userActions: UserActions,
    private _ngZone: NgZone
  ) {
  }

  /**
   * Query for a node
   * @param  {String} query
   */
  onChange(event, query) {

    if (event.keyCode === 13) {
      this._searchIndex++;
    } else {
      this._searchIndex = 1;
    }
    query = query.toLocaleLowerCase();

    this.userActions.searchNode({ query, index: this._searchIndex });
    this._ngZone.run(() => undefined);
  }

}
