import {Component, Inject, NgZone, ElementRef} from 'angular2/core';
import {ComponentDataStore}
  from '../../stores/component-data/component-data-store';
import {UserActions} from '../../actions/user-actions/user-actions';
import {UserActionType}
  from '../../actions/action-constants';

@Component({
  selector: 'tree-search',
  templateUrl: 'src/frontend/components/tree-search/tree-search.html'
})

export class TreeSearch {

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
