import {Injectable} from '@angular/core';

import {
  Observable,
  Subject,
} from 'rxjs';

import {Node} from '../../tree';

export enum ExpansionState {
  Expanded,
  Collapsed,
}

@Injectable()
export class NodeRenderState {
  private subject = new Subject<void>();

  private expansion = new WeakMap<Node, ExpansionState>();

  private selected = new Set<Node>();

  get changes(): Observable<void> {
    return this.subject.asObservable();
  }

  setExpansionState(node: Node, state: ExpansionState) {
    this.expansion.set(node, state);

    this.publish();
  }

  getExpansionState(node: Node) {
    return this.expansion.get(node) || ExpansionState.Expanded;
  }

  select(node: Node | Array<Node>) {
    this.selected = new Set<Node>(Array.isArray(node) ? node : [node]);

    this.publish();
  }

  private publish() {
    this.subject.next(void 0);
  }
}
