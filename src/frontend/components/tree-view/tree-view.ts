import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';

import {
  MutableTree,
  Node,
} from '../../../tree';

import {UserActions} from '../../actions/user-actions/user-actions';
import {Search} from '../search/search';

@Component({
  selector: 'bt-tree-view',
  template: require('./tree-view.html'),
})
export class TreeView {
  @Input() private selectedNode: Node;
  @Input() private tree: MutableTree;

  @Output() private collapseChildren = new EventEmitter<Node>();
  @Output() private expandChildren = new EventEmitter<Node>();
  @Output() private inspectElement = new EventEmitter<Node>();
  @Output() private selectNode = new EventEmitter<Node>();

  @ViewChild(Search) private search: Search;

  private searchNode: Node;

  constructor(private userActions: UserActions) {}

  ngOnChanges(changes) {
    if (this.search === null) {
      return;
    }

    if (changes.hasOwnProperty('selectedNode') && this.selectedNode !== this.searchNode) {
      this.searchNode = null;
      this.search.reset();
    }
  }

  private onRetrieveSearchResults = (query: string): Promise<Array<any>> => {
    return this.userActions.searchComponents(this.tree, query);
  }

  private onSelectedSearchResultChanged(node: Node) {
    this.searchNode = node;
    this.selectNode.emit(node);
  }
}
