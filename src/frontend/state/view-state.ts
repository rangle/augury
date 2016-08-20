import {Injectable} from '@angular/core';

import {
  Observable,
  Subject,
} from 'rxjs';

import {Node} from '../../tree';

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

  private selected = new Set<string>();

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

  selectedState(node: Node, selected?: boolean) {
    checkReferenceId(node);

    if (selected != null) {
      this.selected.add(node.id);
      this.publish();
    }
    else {
      return this.selected.has(node.id);
    }
  }

  select(node: Node | Array<Node>) {
    if (Array.isArray(node)) {
      node.forEach(n => checkReferenceId(n));
    }
    else {
      checkReferenceId(node);
    }

    this.selected = new Set<string>(
      Array.isArray(node)
        ? node.map(n => n.id)
        : [node.id]);

    this.publish();
  }

  private publish() {
    this.subject.next(void 0);
  }
}
