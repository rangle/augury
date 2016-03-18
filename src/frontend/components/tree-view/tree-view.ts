import {Component, Inject, NgZone} from 'angular2/core';
import {NgFor} from 'angular2/common';
import {NodeItem} from '../node-item/node-item';
import {InfoPanel} from '../info-panel/info-panel';
import {UserActions} from '../../actions/user-actions/user-actions';
import {ComponentDataStore}
  from '../../stores/component-data/component-data-store';
import {UserActionType}
  from '../../actions/action-constants';

@Component({
  selector: 'bt-tree-view',
  properties: ['tree: tree'],
  templateUrl: 'src/frontend/components/tree-view/tree-view.html',
  directives: [NgFor, NodeItem, InfoPanel]
})
/**
 * The Tree View
 * Displays the components' hierarchy
 */
export class TreeView {

  private tree: any;
  private searchIndex: number = 0;
  private totalSearchCount: number = 0;

  constructor(
    private userActions: UserActions,
    private componentDataStore: ComponentDataStore,
    private _ngZone: NgZone
  ) {
    this.componentDataStore.dataStream
      .subscribe((data: any) => {
        this.totalSearchCount = data.totalSearchCount;
      });
  }

  /**
   * Query for a node
   * @param  {String} query
   */
  onChange(event, query, isNext) {

    if (query.length === 0) {
      return;
    }

    if (isNext === undefined && event.keyCode === 13) {
      this.searchIndex++;
    } else if (isNext === undefined) {
      this.searchIndex = 0;
    } else if (isNext) {
      this.searchIndex++;
    } else if (!isNext) {
      this.searchIndex--;
    }

    // cycle over the search results if reached at the end
    if (this.searchIndex === this.totalSearchCount) {
      this.searchIndex = 0;
    } else if (this.searchIndex < 0) {
      this.searchIndex = this.totalSearchCount - 1;
    }

    query = query.toLocaleLowerCase();

    this.userActions.searchNode({ query, index: this.searchIndex });
    this._ngZone.run(() => undefined);
  }

}
