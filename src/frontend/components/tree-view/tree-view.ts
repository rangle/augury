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
  templateUrl: './tree-view.html',
})
export class TreeView {
  @Input() selectedNode: Node;
  @Input() tree: MutableTree;

  @Output() collapseChildren = new EventEmitter<Node>();
  @Output() expandChildren = new EventEmitter<Node>();
  @Output() inspectElement = new EventEmitter<Node>();
  @Output() selectNode = new EventEmitter<Node>();

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

  onRetrieveSearchResults = (query: string): Promise<Array<any>> => {
    return this.userActions.searchComponents(this.tree, query);
  }

  onSelectedSearchResultChanged(node: Node) {
    this.searchNode = node;
    this.selectNode.emit(node);
  }
}
