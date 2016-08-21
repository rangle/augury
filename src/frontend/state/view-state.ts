import {Injectable} from '@angular/core';

import {
  Observable,
  Subject,
} from 'rxjs';

import {
  MutableTree,
  Node,
  deserializePath,
} from '../../tree';

export enum ExpandState {
  Expanded,
  Collapsed,
}

const checkReferenceId = (node: Node) => {
  if (node == null) {
    throw new Error('Node has no associated ID');
  }
}

@Injectable()
export class ViewState {
  private subject = new Subject<void>();

  private expansion = new Map<string, ExpandState>();

  private selected: string; // node path ID

  get changes(): Observable<void> {
    return this.subject.asObservable();
  }

  expandState(node: Node, expandState?: ExpandState) {
    checkReferenceId(node);

    if (expandState != null) {
      this.expansion.set(node.id, expandState);
      this.publish();
    }
    else {
      const state = this.expansion.get(node.id);

      return state == null
        ? ExpandState.Expanded
        : state;
    }
  }

  selectionState(node: Node): boolean {
    return this.selected === node.id;
  }

  selectedTreeNode(tree: MutableTree): Node {
    if (this.selected == null) {
      return null;
    }

    const path = deserializePath(this.selected);

    return tree.traverse(path);
  }

  select(node: Node) {
    checkReferenceId(node);

    this.selected = node.id;

    this.publish();
  }

  unselect() {
    this.selected = null;
    this.publish();
  }

  private publish() {
    this.subject.next(void 0);
  }
}
